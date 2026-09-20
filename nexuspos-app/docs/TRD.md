# NEXUSPOS Technical Requirements Document (TRD)

**Project Name:** NEXUSPOS Enterprise Point of Sale  
**Architecture Document Version:** 1.0.0  
**Stack:** Next.js 16.3 (Turbopack), React 19, TypeScript 5, Tailwind CSS v4, PostgreSQL, Prisma / Raw PG Client

---

## 1. System Architecture Overview

NEXUSPOS uses a full-stack Next.js App Router architecture with strict separation of concerns across presentation, API routing/server actions, domain services, and database persistence layers.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Browser Layer                          │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │ POS Register Engine   │  │ Management Shell  │  │ Reports View   │  │
│  │ (Client Interactive)  │  │ (SSR / Client)    │  │ (Dynamic)      │  │
│  └───────────┬───────────┘  └─────────┬─────────┘  └────────┬───────┘  │
└──────────────┼────────────────────────┼─────────────────────┼──────────┘
               │ HTTPS (JSON / REST / Server Actions)        │
               ▼                        ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js 16 Edge / Node.js Runtime                    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Next.js Middleware (Session Auth, Route Guards, RBAC Injection)  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ API Route Handlers (`src/app/api/*`) & Server Actions            │  │
│  │  - Input Validation (Zod Schemas)                                │  │
│  │  - Session Context Extraction (`userId`, `branchId`, `role`)     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Domain Service Layer (`src/server/services/*`)                   │  │
│  │  - SalesCheckoutService   - InventoryLedgerService               │  │
│  │  - PurchasingService      - ReportingService                     │  │
│  │  - AuthService            - PayrollService                       │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Data Repositories & ACID Transactions (`src/server/repositories`)│  │
│  │  - Atomic DB transactions (`pgPool.connect()` / Prisma client)   │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      ▼ SQL (TCP Connection Pool)
┌────────────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Relational Database                     │
│  - Normalized Tables (Organizations, Branches, Users, Products,        │
│    Sales, SaleItems, InventoryLedger, Batches, Recipes, Customers)     │
│  - Foreign Keys, Indexes, Constraints, Soft Deletions                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Server & Client Component Boundaries

To optimize performance, security, and rendering speed:
1. **Server Components by Default:** Page wrappers, data fetching containers, report shells, and layout navigation bars are rendered on the server to eliminate initial client hydration waterfalls.
2. **Client Components with `'use client'` Directive:** Restricted to stateful, interactive widgets:
   - POS Cart and Barcode scanner listener (`src/app/pos/page.tsx`)
   - Modal dialogs (`Dialog.tsx`, `ReceiptDialog.tsx`, `BaristaKdsModal.tsx`)
   - Interactive data tables with client-side quick filtering and column sorting (`DataTable.tsx`)
   - Interactive charts and KPI switchers (`recharts` wrappers)

---

## 3. Database Strategy & Connection Pooling

### 3.1 Database Driver Configuration
NEXUSPOS connects to PostgreSQL using `pg.Pool` or Prisma ORM with connection reuse across serverless and long-running Node.js processes.
- **Connection Pool Configuration:**
  - `max`: 20 connections per container instance
  - `idleTimeoutMillis`: 30,000ms
  - `connectionTimeoutMillis`: 5,000ms
  - `ssl`: Configurable via `DB_SSL=true` for cloud providers (Supabase, Neon, AWS RDS)
- **Monetary Precision:** All currency amounts are stored as `NUMERIC(12, 2)` or integer cents in database columns, never `FLOAT` or `DOUBLE PRECISION`.

---

## 4. Authentication, Session & Authorization Architecture

### 4.1 Session Strategy
1. **Token Standard:** JWT or secure server-side session token containing:
   ```json
   {
     "sub": "user_id_123",
     "username": "admin",
     "role": "ADMINISTRATOR",
     "branchId": 1,
     "orgId": 1,
     "permissions": ["sales.create", "inventory.adjust", "reports.view"],
     "exp": 1790000000
   }
   ```
2. **Cookie Attributes:**
   - `Name`: `nexuspos_session`
   - `HttpOnly`: `true` (Inaccessible to browser JavaScript / XSS protection)
   - `Secure`: `true` in production (HTTPS only)
   - `SameSite`: `Strict` (CSRF mitigation)
   - `Path`: `/`
   - `Max-Age`: `86400` (24 hours)

### 4.2 Middleware Route Guard (`src/middleware.ts`)
The middleware intercepts all incoming requests to protected routes (`/dashboard`, `/pos`, `/sales`, `/products`, `/reports`, `/settings`, etc.):
1. Reads `nexuspos_session` cookie.
2. Verifies cryptographic signature using `JWT_SECRET`.
3. If invalid or missing, redirects to `/login?redirect=${encodeURIComponent(pathname)}`.
4. Checks role permissions against route hierarchy (e.g., only `ADMINISTRATOR` or `MANAGER` can access `/permissions/*` or `/settings`).
5. Passes authenticated user context to downstream handlers via request headers (`x-user-id`, `x-branch-id`, `x-user-role`).

---

## 5. POS Transaction & Financial Integrity Architecture

The `POST /api/pos/checkout` route executes within an atomic database transaction:

```typescript
// Architectural Pattern for Checkout Transaction
export async function executeCheckoutTransaction(client: PoolClient, orderData: CheckoutPayload) {
  await client.query("BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;");
  try {
    // 1. Validate pricing & recalculate totals on server
    const verifiedItems = await recalculateAndVerifyItems(client, orderData.items, orderData.branchId);
    const { subtotal, discountTotal, taxTotal, serviceTotal, grandTotal } = computeTotals(verifiedItems, orderData);

    // 2. Insert Sale Record
    const saleResult = await client.query(
      `INSERT INTO sales (order_no, branch_id, user_id, customer_id, table_id, order_type, subtotal, discount_amount, tax_amount, service_charge, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'COMPLETED') RETURNING id, order_no, created_at`,
      [generateOrderNo(), orderData.branchId, orderData.userId, orderData.customerId, orderData.tableId, orderData.orderType, subtotal, discountTotal, taxTotal, serviceTotal, grandTotal]
    );
    const saleId = saleResult.rows[0].id;

    // 3. Insert Line Items & Deduct Inventory / Recipes
    for (const item of verifiedItems) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, cost_price, discount_amount, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [saleId, item.productId, item.quantity, item.unitPrice, item.costPrice, item.discountAmount, item.lineTotal]
      );

      // Ledger deduction
      await recordInventoryMovement(client, {
        productId: item.productId,
        branchId: orderData.branchId,
        movementType: "SALE",
        quantity: -item.quantity,
        referenceId: saleId,
        referenceType: "SALE",
        userId: orderData.userId,
      });
    }

    // 4. Record Payments
    for (const payment of orderData.payments) {
      await client.query(
        `INSERT INTO sale_payments (sale_id, payment_method, amount, reference_no)
         VALUES ($1, $2, $3, $4)`,
        [saleId, payment.method, payment.amount, payment.referenceNo]
      );
    }

    // 5. Commit Transaction
    await client.query("COMMIT;");
    return { success: true, saleId, orderNo: saleResult.rows[0].order_no };
  } catch (error) {
    await client.query("ROLLBACK;");
    throw error;
  }
}
```

---

## 6. Input Validation & Error Handling

- **Validation Library:** `zod` schemas for all incoming HTTP payloads and form submissions.
- **Global Error Handling:**
  - Standardized JSON error response format:
    ```json
    {
      "success": false,
      "error": {
        "code": "INSUFFICIENT_STOCK",
        "message": "Item 'Americano' has insufficient stock in Colombo Branch.",
        "details": []
      },
      "requestId": "req_8f192b0c"
    }
    ```
  - `error.tsx` route boundaries for UI crash recovery.
  - Server errors masked in production to avoid exposing stack traces or raw database queries.

---

## 7. Logging & Observability

- Structured JSON logging on the server including `timestamp`, `level`, `requestId`, `userId`, `branchId`, `action`, and `durationMs`.
- System Audit Log table (`audit_logs`) recording all high-impact mutations (price adjustments, voids, manual discounts, user permission grants, inventory write-offs).
