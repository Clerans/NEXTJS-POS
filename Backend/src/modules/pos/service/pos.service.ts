import { pool } from '../../../config/db.js';
import { POSRepository } from '../repository/pos.repository.js';
import { AuthService } from '../../auth/service/auth.service.js';
import { CreatePOSOrderDto, VoidOrderDto, POSOrderResponseDto, KDSOrderTicketDto } from '../dto/pos.dto.js';
import { UnprocessableEntityError, ForbiddenError, NotFoundError } from '../../../common/errors/app-error.js';

export class POSService {
  private posRepository: POSRepository;
  private authService: AuthService;

  constructor() {
    this.posRepository = new POSRepository();
    this.authService = new AuthService();
  }

  async processOrder(
    dto: CreatePOSOrderDto,
    cashierId: number,
    userRole: string = 'CASHIER',
    offlineRef?: string
  ): Promise<POSOrderResponseDto> {
    const effectiveOfflineRef = offlineRef || dto.offlineRef;
    if (effectiveOfflineRef) {
      const existing = await this.posRepository.findOrderByOfflineRef(effectiveOfflineRef);
      if (existing) {
        return existing;
      }
    }

    if (!dto.items || dto.items.length === 0) {
      throw new UnprocessableEntityError('Order must contain at least one item');
    }

    const branchId = dto.branchId || 1;

    // 1. Fetch system settings for Tax % and Service Charge %
    const settingsRes = await pool.query(
      'SELECT tax_percentage FROM system_settings WHERE branch_id = $1 LIMIT 1',
      [branchId]
    );
    const taxPercentage = settingsRes.rows.length > 0 ? parseFloat(settingsRes.rows[0].tax_percentage) : 10.00;

    // 2. Fetch authoritative database product prices
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of dto.items) {
      if (item.quantity <= 0) {
        throw new UnprocessableEntityError(`Invalid quantity ${item.quantity} for product ID #${item.productId}`);
      }

      const prodRes = await pool.query(
        'SELECT id, name, retail_price, is_active FROM products WHERE id = $1',
        [item.productId]
      );

      if (prodRes.rows.length === 0) {
        throw new NotFoundError(`Product ID #${item.productId} not found in catalog`);
      }

      const product = prodRes.rows[0];
      if (!product.is_active) {
        throw new UnprocessableEntityError(`Product "${product.name}" is inactive and cannot be sold`);
      }

      const unitPrice = parseFloat(product.retail_price);
      calculatedSubtotal += unitPrice * item.quantity;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      });
    }

    const discountAmount = dto.discountAmount || 0;

    // Role-based discount authorization caps
    const maxDiscountPercent = userRole === 'ADMINISTRATOR' ? 100 : userRole === 'MANAGER' ? 25 : 10;
    const allowedDiscountAmount = (calculatedSubtotal * maxDiscountPercent) / 100;
    if (discountAmount > allowedDiscountAmount) {
      throw new ForbiddenError(
        `Discount of Rs. ${discountAmount.toFixed(2)} exceeds maximum permitted ${maxDiscountPercent}% limit for role ${userRole}`
      );
    }

    const taxableBase = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Math.round((taxableBase * (taxPercentage / 100)) * 100) / 100;

    // 5% service charge for Dine-In orders
    const serviceCharge = dto.orderType === 'DINE_IN' ? Math.round((calculatedSubtotal * 0.05) * 100) / 100 : 0;

    const grandTotal = Math.round((taxableBase + taxAmount + serviceCharge) * 100) / 100;

    // 3. Payment & Credit Limit Validation
    if (dto.paymentMethod === 'CASH' && dto.amountPaid < grandTotal) {
      throw new UnprocessableEntityError(
        `Insufficient payment amount. Total order cost is Rs. ${grandTotal.toFixed(2)}, paid Rs. ${dto.amountPaid.toFixed(2)}`
      );
    }

    if (dto.paymentMethod === 'CREDIT') {
      if (!dto.customerId) {
        throw new UnprocessableEntityError('Customer selection is required for credit purchases');
      }

      const custRes = await pool.query(
        `SELECT id, name, COALESCE(credit_limit, 0) as credit_limit, COALESCE(outstanding_balance, 0) as outstanding_balance
         FROM customers WHERE id = $1`,
        [dto.customerId]
      );

      if (custRes.rows.length === 0) {
        throw new NotFoundError(`Customer ID #${dto.customerId} not found`);
      }

      const customer = custRes.rows[0];
      const creditLimit = parseFloat(customer.credit_limit || '0');
      const currentBalance = parseFloat(customer.outstanding_balance || '0');
      const projectedBalance = currentBalance + grandTotal;

      if (projectedBalance > creditLimit) {
        if (dto.managerPin) {
          const isPinValid = await this.authService.verifyPin(dto.managerPin, cashierId);
          if (!isPinValid) {
            throw new ForbiddenError('Invalid Manager PIN code for credit limit override');
          }
        } else {
          throw new UnprocessableEntityError(
            `Credit limit exceeded (Limit: ${creditLimit}, Current Balance: ${currentBalance}, Order Total: ${grandTotal})`
          );
        }
      }
    }

    // Guaranteed Unique Order Number using timestamp sequence
    const orderNo = `#ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    const validatedDto: CreatePOSOrderDto = {
      ...dto,
      branchId,
      items: validatedItems,
      discountAmount,
      taxAmount,
      serviceCharge,
    };

    return await this.posRepository.createOrder(
      validatedDto,
      cashierId,
      orderNo,
      calculatedSubtotal,
      taxAmount,
      serviceCharge,
      grandTotal,
      effectiveOfflineRef
    );
  }

  async voidOrder(dto: VoidOrderDto, userId: number): Promise<void> {
    // Validate manager PIN using AuthService
    const isPinValid = await this.authService.verifyPin(dto.managerPin, userId);
    if (!isPinValid) {
      throw new ForbiddenError('Invalid manager PIN code for order void authorization');
    }

    await this.posRepository.voidOrder(dto.orderId, dto.reason, userId);
  }

  async getKDSOrders(): Promise<KDSOrderTicketDto[]> {
    return await this.posRepository.getKDSOrders();
  }

  async updateKDSStatus(orderId: number | string, newStatus: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED'): Promise<void> {
    const existing = await this.posRepository.findKDSOrderById(orderId);
    if (!existing) {
      throw new NotFoundError(`KDS Ticket / Order #${orderId} not found`);
    }

    const currentStatus = existing.kdsStatus;

    // Transition validation rules
    const allowedTransitions: Record<string, string[]> = {
      RECEIVED: ['PREPARING'],
      PREPARING: ['READY'],
      READY: ['SERVED'],
      SERVED: [],
    };

    const validNext = allowedTransitions[currentStatus] || [];
    if (!validNext.includes(newStatus)) {
      throw new UnprocessableEntityError(
        `Invalid KDS status transition from "${currentStatus}" to "${newStatus}"`
      );
    }

    await this.posRepository.updateKDSStatus(orderId, newStatus);
  }

  async getAllOrders(filters: {
    search?: string;
    branchId?: number;
    orderType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return await this.posRepository.getAllOrders(filters);
  }

  async getOrderById(orderId: number) {
    const order = await this.posRepository.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError(`POS Order #${orderId} not found`);
    }
    return order;
  }
}
