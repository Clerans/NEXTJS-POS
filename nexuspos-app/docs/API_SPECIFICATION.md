# NEXUSPOS REST API & Server Action Specification

**API Standard:** RESTful JSON & Next.js Server Actions  
**Authentication Scheme:** HTTP-Only Bearer / Session Cookie (`nexuspos_session`)  
**Base Path:** `/api`  
**Content-Type:** `application/json`

---

## 1. Response & Error Contract

### Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully.",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more input fields are invalid.",
    "details": [
      { "field": "retailPrice", "issue": "Price must be a positive number" }
    ]
  },
  "requestId": "req_6f2e9a1"
}
```

---

## 2. Authentication & Authorization Endpoints

### 2.1 `POST /api/auth/login`
- **Description:** Authenticates user credentials via bcrypt hash comparison and issues an HTTP-only session cookie.
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "SecurePassword123!"
  }
  ```
- **Responses:**
  - `200 OK`: Sets `Set-Cookie: nexuspos_session=...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
  - `401 Unauthorized`: `{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid username or password" } }`
  - `429 Too Many Requests`: Account locked or rate limit exceeded.

### 2.2 `POST /api/auth/logout`
- **Description:** Invalidates server session token and clears the cookie.
- **Response:** `200 OK` with expired cookie.

### 2.3 `POST /api/auth/verify-pin`
- **Description:** Authorizes high-privilege manager overrides (manual discounts, voids, drawer open).
- **Request Body:** `{ "pin": "1234", "action": "VOID_ORDER" }`
- **Response:** `200 OK` `{ "success": true, "authorizedBy": "Kasun Perera (Manager)" }`

---

## 3. POS Engine Endpoints

### 3.1 `POST /api/pos/checkout`
- **Description:** Atomically completes a sales transaction, deducts inventory ledger, records payments, updates customer credit balance, and generates official receipt.
- **Request Body:**
  ```json
  {
    "branchId": 1,
    "orderType": "DINE_IN",
    "customerId": 2,
    "tableId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "unitPrice": 850.00,
        "discountAmount": 0.00,
        "notes": "Extra hot"
      }
    ],
    "manualDiscount": 0,
    "payments": [
      {
        "method": "CASH",
        "amount": 1700.00,
        "tendered": 2000.00,
        "change": 300.00
      }
    ]
  }
  ```
- **Response:** `201 Created` with full verified receipt payload and unique `orderNo`.

### 3.2 `POST /api/pos/hold-order`
- **Description:** Persists an uncompleted cart to the database with a customer/table tag.
- **Response:** `200 OK` with `heldOrderId`.

### 3.3 `GET /api/pos/held-orders`
- **Description:** Retrieves all active held carts for the current branch.

---

## 4. Product & Inventory Endpoints

### 4.1 `GET /api/products`
- **Query Parameters:** `?search=cappuccino&category=1&page=1&limit=25&active=true`
- **Response:** Paginated list of products with current branch stock and category info.

### 4.2 `POST /api/products`
- **Description:** Creates a new product with SKU validation and opening stock.
- **Request Body:** Zod-validated product schema.

### 4.3 `POST /api/inventory/adjust`
- **Description:** Submits a stock adjustment with mandatory audit reason code.
- **Request Body:**
  ```json
  {
    "productId": 4,
    "branchId": 1,
    "quantityDelta": -2,
    "reasonCode": "DAMAGED_IN_TRANSIT",
    "notes": "Broken glass bottle during shelf restocking"
  }
  ```

---

## 5. Purchasing & GRN Endpoints

### 5.1 `POST /api/purchase-orders`
- **Description:** Creates a drafted PO.
- **Request Body:** Supplier ID, expected delivery date, line items with quantities and unit costs.

### 5.2 `POST /api/grn/receive`
- **Description:** Processes GRN submission, creating batch entries and incrementing warehouse inventory ledger.
- **Request Body:** PO reference, supplier invoice no, received line items with batch numbers and expiration dates.

---

## 6. Reports & Aggregations Endpoints

### 6.1 `GET /api/reports/sales-summary`
- **Query Parameters:** `?startDate=2026-09-01&endDate=2026-09-20&branchId=1`
- **Response:** Aggregated gross sales, discounts, net sales, taxes, service charges, and order counts grouped by day.

### 6.2 `GET /api/reports/export-csv`
- **Query Parameters:** `?reportType=sales_summary&startDate=2026-09-01&endDate=2026-09-20`
- **Response:** `Content-Type: text/csv` with `Content-Disposition: attachment; filename="sales_summary_report.csv"`.
