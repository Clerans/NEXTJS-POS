export const posSwaggerDocs = {
  '/pos/kds': {
    get: {
      tags: ['POS & Sales'],
      summary: 'Get Barista Kitchen Display Active Tickets',
      description: 'Returns active KDS tickets with status RECEIVED, PREPARING, or READY.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Active KDS tickets list' },
      },
    },
  },
  '/pos/kds/{orderId}/status': {
    patch: {
      tags: ['POS & Sales'],
      summary: 'Update Barista KDS Ticket Workflow Status',
      description: 'Advances KDS status (RECEIVED -> PREPARING -> READY -> SERVED).',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: { type: 'string', enum: ['RECEIVED', 'PREPARING', 'READY', 'SERVED'], example: 'PREPARING' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'KDS status updated' },
        422: { description: 'Invalid transition' },
      },
    },
  },
  '/pos/orders': {
    get: {
      tags: ['POS & Sales'],
      summary: 'Get Sales Orders History',
      description: 'Returns paginated list of sales orders with customer info, total amounts, and item breakdown summaries.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for order_no or customer name/mobile' },
        { name: 'branchId', in: 'query', schema: { type: 'integer' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
      ],
      responses: {
        200: { description: 'Sales orders history list retrieved successfully' },
      },
    },
    post: {
      tags: ['POS & Sales'],
      summary: 'Process & Settle POS Sales Order',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['branchId', 'orderType', 'items', 'paymentMethod', 'amountPaid'],
              properties: {
                branchId: { type: 'number', example: 1 },
                orderType: { type: 'string', example: 'TAKE_AWAY' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      productId: { type: 'number', example: 1 },
                      quantity: { type: 'number', example: 2 },
                      unitPrice: { type: 'number', example: 450.00 },
                    },
                  },
                },
                paymentMethod: { type: 'string', example: 'CASH' },
                amountPaid: { type: 'number', example: 1000.00 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Order Settled & Ticket Created' },
        422: { description: 'Insufficient Payment' },
      },
    },
  },
  '/pos/orders/{id}': {
    get: {
      tags: ['POS & Sales'],
      summary: 'Get Detailed Sales Order Breakdown',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Order ID or Order Number' },
      ],
      responses: {
        200: { description: 'Sales order details retrieved successfully' },
        404: { description: 'Sales order not found' },
      },
    },
  },
  '/pos/orders/void': {
    post: {
      tags: ['POS & Sales'],
      summary: 'Void Sales Ticket (Requires Manager PIN)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['orderId', 'reason', 'managerPin'],
              properties: {
                orderId: { type: 'number', example: 8821 },
                reason: { type: 'string', example: 'Customer cancelled before prep' },
                managerPin: { type: 'string', example: '1234' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Ticket Voided' },
        403: { description: 'Invalid Manager PIN' },
      },
    },
  },
};
