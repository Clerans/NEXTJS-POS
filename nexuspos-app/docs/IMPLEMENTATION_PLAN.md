# NEXUSPOS Master Engineering Implementation Plan

**Goal:** Transform the existing `nexuspos-app` Next.js frontend prototype into a production-grade, secure, multi-branch Enterprise POS and Business Management suite with relational persistence, transactional integrity, and complete RBAC.

---

## Phase Breakdown & Execution Sequence

### Phase 1: Code Health, Hygiene & Documentation (Immediate Priority)
1. **ESLint & React 19 Fixes:**
   - Resolve `react-hooks/immutability` warning in `/pos/page.tsx` (mutating `selectedCustomer` after render).
   - Resolve `react-hooks/set-state-in-effect` in `Topbar.tsx`.
   - Clean up unused imports and variables across all components to achieve a 100% clean lint pass.
2. **Master Specification Baseline:**
   - Maintain all 12 living engineering and product documents in `/docs/`.

### Phase 2: Database Persistence & Repository Layer
1. **PostgreSQL Connection Pool & Schema Deployment:**
   - Build lightweight, resilient query runner and migration scripts based on `/docs/DATABASE_SCHEMA.md`.
   - Implement database seed script inserting full operational data (admin users with hashed passwords, branches, products, recipes, tables, categories, units, customer groups).
2. **Domain Repositories:**
   - Create `src/server/repositories/` for Products, Customers, Orders, Inventory, Users, and Reports.

### Phase 3: Authentication, Session Management & Middleware Route Protection
1. **Cryptographic Auth API:**
   - Update `POST /api/auth/login` to verify salted bcrypt password hashes.
   - Issue signed HTTP-only session cookie (`nexuspos_session`).
   - Implement `POST /api/auth/logout` and session invalidation.
   - Implement `POST /api/auth/verify-pin` for Manager overrides.
2. **Next.js Edge Middleware (`src/middleware.ts`):**
   - Intercept requests to `/dashboard`, `/pos`, `/sales`, `/products/*`, `/reports/*`, `/settings`.
   - Verify session token signature.
   - Enforce RBAC permissions per route.

### Phase 4: POS Sales Transaction Engine & Integrity
1. **Server-Side Checkout Transaction (`POST /api/pos/checkout`):**
   - Recalculate item prices and tax on server.
   - Deduct inventory or recipe raw materials in an atomic database transaction.
   - Record immutable `SALE` movement in `inventory_ledger`.
   - Return signed receipt object.
2. **Shift Management & Cash Reconciliation:**
   - Support opening float, cash drops, and end-of-shift Z-report count.
3. **Order Parking & Recall:**
   - Server-backed held cart persistence.

### Phase 5: Ledger-Based Inventory & Stock Movements
1. **Double-Entry Movement Engine:**
   - Replace scalar stock updates with `InventoryLedger` entries.
2. **Stock Adjustments & Reconciliation:**
   - Adjustment dialog with reason codes and cost impacts.
3. **Inter-Branch Stock Transfers:**
   - Dual-step dispatch and receipt confirmation.

### Phase 6: Purchasing, GRN & Returns Workflows
1. **Goods Receiving Note (GRN) Processing:**
   - Atomic inventory increment, batch number and expiry logging.
2. **Returns & Refunds:**
   - Receipt lookup, partial/full returns, optional restocking ledger entry, and refund issuance.

### Phase 7: Dynamic Reports & Business Intelligence
1. **Real-Time SQL Aggregations:**
   - Connect all 18 report pages (`/reports/*`) to live database queries with date range, branch, and cashier filters.
2. **Export Engine:**
   - CSV export endpoints for all reports.

### Phase 8: Quality Assurance & Automated Testing
1. **Unit & Integration Test Suites:**
   - Automated tests for money math, tax rounding, POS checkout transactions, and ledger rollback.
2. **Verification & Build Validation:**
   - Verify `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass cleanly.
