# NEXUSPOS Testing & Quality Assurance Strategy

**Test Frameworks:** Vitest / Playwright / Testing Library / Node Assert  
**Target Coverage:** Core POS Math, Ledger Transactions, Auth Guards, and Critical User Journeys.

---

## 1. Test Pyramid & Scope

```
                ▲
               / \
              /   \
             / E2E \       (Playwright - 10-15 Critical Flows: Login -> Sale -> Refund -> Stock Check)
            /-------\
           /  Integ  \     (API Route & DB Transaction Rollbacks - Checkout, GRN, Transfers)
          /-----------\
         /    Unit     \   (Zod Validation, Tax/Discount Math, Decimal Precision, Currency Format)
        /---------------\
```

---

## 2. Critical Test Suites & Test Cases

### 2.1 Unit Tests (`src/__tests__/unit/`)
- **Money & Tax Calculations (`math.test.ts`):**
  - Verify rounding behavior on fractional tax rates (e.g. 2.5% VAT on Rs. 333.33).
  - Verify zero floating-point accumulation errors on multi-item orders.
  - Verify customer group percentage discounts vs fixed promo discounts.
- **Zod Schema Validation (`validation.test.ts`):**
  - Product creation rejecting negative prices or missing SKUs.
  - Checkout payload rejecting empty carts or negative quantities.
  - User creation rejecting weak passwords (< 8 characters, missing numbers/symbols).

### 2.2 Integration & Transaction Tests (`src/__tests__/integration/`)
- **POS Checkout Atomic Rollback (`checkout-transaction.test.ts`):**
  - Simulate database connection failure or constraint violation midway through item insertion.
  - Assert that NO rows remain in `sales`, `sale_items`, or `inventory_ledger`.
- **Ledger Invariance (`inventory-ledger.test.ts`):**
  - Given initial stock 10, process a sale of 2 items -> stock must equal 8, ledger entry `-2`.
  - Process customer return of 1 item with restocking -> stock must equal 9, ledger entry `+1`.

### 2.3 End-to-End Tests (`e2e/`)
- **E2E-01: Cashier POS Order Lifecycle:**
  - Login as `cashier_colombo`.
  - Open `/pos`.
  - Filter category `Beverages`, click `Cappuccino Regular`.
  - Open Payment Modal, tender exact cash.
  - Verify receipt modal appears with correct totals and printable layout.
- **E2E-02: Manager Override Authorization:**
  - Cashier attempts to apply 25% manual discount.
  - Verify Manager PIN prompt is displayed.
  - Enter valid PIN `1234` -> Discount applied.
  - Enter invalid PIN `9999` -> Error displayed, discount blocked.

---

## 3. CI/CD Automated Test Matrix

```bash
# Available npm scripts in package.json
npm run lint         # ESLint check for React 19 rules and code hygiene
npx tsc --noEmit     # Full TypeScript strict typechecking
npm run test:unit    # Vitest unit test runner
npm run test:e2e     # Playwright headless browser test suite
npm run build        # Production Next.js Turbopack build
```
