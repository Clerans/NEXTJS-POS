# NEXUSPOS Security Model & Threat Mitigation Strategy

**Document Version:** 1.0.0  
**Target Security Compliance:** OWASP Top 10, PCI-DSS SAQ-A Equivalent (POS Architecture), Data Protection & Least Privilege.

---

## 1. Threat Matrix & Defense Strategy

| Vulnerability Category | Potential Attack Vector in POS | Implemented Defense Mechanism |
|---|---|---|
| **A01: Broken Access Control** | Changing `branchId` or `userId` in API payloads to manipulate another store's sales or inventory. | **Session-Derived Scoping:** `branchId`, `orgId`, and `userId` are strictly extracted from the authenticated server session token, never trusted from client request bodies. |
| **A02: Cryptographic Failures** | Plaintext or weakly hashed passwords; leaked tokens in browser storage. | **Bcrypt with 12 Salt Rounds:** Passwords and Manager Override PINs are salted and hashed. Tokens stored exclusively in HTTP-only, Secure, SameSite=Strict cookies. |
| **A03: Injection (SQL & Command)** | Malicious strings in product search, barcode scanners, or customer inputs. | **Parameterized Queries & Prisma ORM:** All SQL commands use parameterized placeholders (`$1, $2`). Zod schema validation strips malicious control characters. |
| **A04: Insecure Design** | Client-side calculation of order grand totals allowing negative discounts or 0-cost checkouts. | **Server Recalculation Engine:** Server ignores client totals and recalculates prices, taxes, discounts, and ledger stock from database truth during the transaction. |
| **A05: Security Misconfiguration** | Unprotected dashboard and cashier routes accessible without authentication. | **Next.js Edge Middleware:** All routes under `/(dashboard)/*` and `/pos/*` pass through strict JWT signature verification before rendering. |
| **A06: Vulnerable Dependencies** | Vulnerabilities in outdated npm packages. | Automated `npm audit` scanning; locked dependencies in `package-lock.json`. |
| **A07: Identification & Auth Failures** | Brute force password guessing or PIN enumeration. | **Rate Limiting & Account Lockout:** 5 failed attempts per 5 minutes triggers progressive delays; audit logging of repeated failures. |
| **A08: Software & Data Integrity** | Tampering with in-transit API requests or unvalidated webhooks. | Mandatory HTTPS (HSTS); CSRF verification for state-mutating requests. |
| **A09: Logging & Observability Gaps** | Cashier voiding orders or stealing cash with no traceable log. | **Immutable Audit Log Table (`audit_logs`):** Logs user ID, timestamp, IP address, old state, and new state for every void, refund, or discount override. |
| **A10: Server-Side Request Forgery** | Malicious URLs in image upload endpoints. | Strict whitelist for image domains; direct upload to private cloud storage (S3/R2/Cloudinary) via signed URLs. |

---

## 2. Role-Based Access Control (RBAC) Hierarchy

```
                                 ┌──────────────────┐
                                 │      OWNER       │ (Full Org Control)
                                 └────────┬─────────┘
                                          │
                                 ┌────────▼─────────┐
                                 │  ADMINISTRATOR   │ (Branches, Users, Settings)
                                 └────────┬─────────┘
                                          │
                   ┌──────────────────────┼──────────────────────┐
                   │                      │                      │
          ┌────────▼─────────┐  ┌─────────▼────────┐  ┌──────────▼─────────┐
          │     MANAGER      │  │    ACCOUNTANT    │  │ INVENTORY_MANAGER  │
          │(Voids, Overrides,│  │(Reports, Taxes,  │  │(PO, GRN, Batches,   │
          │ Shifts, Staff)   │  │ Payroll, Ledgers)│  │ Transfers, Counts) │
          └────────┬─────────┘  └──────────────────┘  └────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
┌────────▼────────┐  ┌────────▼─────────┐
│     CASHIER     │  │     BARISTA      │
│(POS Sales,      │  │(KDS View,        │
│ Receipts, Hold) │  │ Order Fulfillment)│
└─────────────────┘  └──────────────────┘
```

---

## 3. Manager Override PIN Protocol

For sensitive actions performed by lower-tier roles (Cashier / Barista), a Manager PIN is required:
1. **Trigger Events:**
   - Manual order discount > 15%
   - Price override on a line item
   - Order void after ticket emission
   - Manual Cash Drawer "No Sale" open
   - Order return without physical receipt
2. **Execution:**
   - Frontend presents PIN dialog (`showPinModal`).
   - Hash of entered 4-digit PIN is sent to `POST /api/auth/verify-pin` with requested action.
   - Server verifies the PIN belongs to a user with `MANAGER` or `ADMINISTRATOR` role assigned to the same branch.
   - Action proceeds and is recorded in `audit_logs`.
