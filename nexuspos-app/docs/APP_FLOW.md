# NEXUSPOS Application Flow & Operational State Diagrams

**Document Version:** 1.0.0  
**Target Workflows:** Auth, POS Sales, Inventory Transfers, Purchasing, Returns, Shift Closing, and Payroll.

---

## 1. Authentication & Route Guard Flow

```mermaid
flowchart TD
    Start([User visits NEXUSPOS URL]) --> CheckCookie{Has valid nexuspos_session cookie?}
    CheckCookie -- No --> RedirectLogin[Redirect to /login?redirect=target]
    RedirectLogin --> EnterCredentials[User Enters Username & Password]
    EnterCredentials --> SubmitLogin[POST /api/auth/login]
    SubmitLogin --> CheckBcrypt{Valid Password Hash?}
    CheckBcrypt -- No --> ShowAuthError[Display 401 Error: Invalid Credentials]
    CheckBcrypt -- Yes --> IssueCookie[Issue HTTP-Only Session Cookie]
    IssueCookie --> RouteDashboard[Redirect to /dashboard or /pos based on Role]
    
    CheckCookie -- Yes --> CheckRolePermission{Role has permission for route?}
    CheckRolePermission -- Yes --> RenderPage[Render Target Page]
    CheckRolePermission -- No --> Show403[Render 403 Forbidden / Access Denied]
```

---

## 2. Frontline POS Checkout & Split Payment Flow

```mermaid
flowchart TD
    POSOpen([Cashier opens /pos]) --> SelectBranch[Verify Active Branch & Shift]
    SelectBranch --> LoadCatalog[Load Products & Active Promotions]
    LoadCatalog --> ScanItem[Scan Barcode / Select Category Tile]
    ScanItem --> AddToCart[Add Product / Modifier to Cart]
    AddToCart --> ApplyCustomer[Select Customer / Apply Tier Discount]
    ApplyCustomer --> CheckDiscount{Manual Discount > 15%?}
    CheckDiscount -- Yes --> PromptManagerPIN[Prompt 4-Digit Manager PIN]
    PromptManagerPIN --> VerifyPIN{Manager PIN Valid?}
    VerifyPIN -- No --> RejectDiscount[Reject Discount Override]
    VerifyPIN -- Yes --> ApplyManualDiscount[Apply Manual Discount]
    CheckDiscount -- No --> ChoosePayment[Choose Tender Method]
    
    ChoosePayment --> PayCash[Cash Payment -> Calculate Change]
    ChoosePayment --> PayCard[Card Payment -> Auth Ref Number]
    ChoosePayment --> PayCredit[Credit Account -> Check Balance Limit]
    ChoosePayment --> PaySplit[Split Payment Across Multiple Methods]
    
    PayCash & PayCard & PayCredit & PaySplit --> SubmitOrder[POST /api/pos/checkout]
    SubmitOrder --> ServerTx{Server DB Transaction}
    ServerTx -- Success --> CommitTx[Commit Sale, Deduct Stock, Issue Receipt]
    CommitTx --> PrintReceipt[Trigger 80mm Thermal Receipt Print]
    CommitTx --> NotifyKDS[Send Order to Kitchen / Barista KDS]
    CommitTx --> ResetCart[Clear Cart for Next Customer]
    ServerTx -- Failure --> RollbackTx[Rollback DB, Display Transaction Error]
```

---

## 3. Inventory Receiving (GRN) & Stock Movement Flow

```mermaid
flowchart TD
    DraftPO([Purchasing Officer creates PO]) --> ApprovePO[Manager Approves PO]
    ApprovePO --> GoodsArrive[Shipment Arrives at Warehouse]
    GoodsArrive --> OpenGRN[Warehouse Staff opens /grn/create]
    OpenGRN --> ScanReceivedItems[Scan Received SKUs & Enter Quantities]
    ScanReceivedItems --> EnterBatchExpiry[Enter Batch Number & Expiry Date]
    EnterBatchExpiry --> SubmitGRN[Submit GRN]
    SubmitGRN --> DBTx{Database Atomic Transaction}
    DBTx --> IncrementStock[Increment Warehouse Stock in DB]
    DBTx --> CreateBatchRecord[Create Inventory Batch Record]
    DBTx --> CreateLedgerEntry[Create Immutable InventoryLedger Entry]
    DBTx --> UpdatePOStatus[Mark PO as RECEIVED or PARTIAL]
    DBTx --> CreateAPInvoice[Create Accounts Payable Record for Supplier]
    DBTx --> Done([Stock Available for Sale in POS])
```

---

## 4. Cashier Shift Reconciliation & Drawer Closing

```mermaid
flowchart TD
    ShiftStart([Cashier starts shift]) --> EnterOpeningFloat[Input Starting Float Rs. 5,000]
    EnterOpeningFloat --> OpenShiftRecord[Create RegisterShift Record: OPEN]
    OpenShiftRecord --> ProcessSales[Process Day's Sales & Cash In/Out]
    ProcessSales --> ShiftEnd([End of Shift / Z-Report])
    ShiftEnd --> CountCashDrawer[Cashier Physical Cash Count]
    CountCashDrawer --> SubmitClosing[Submit Closing Actual Cash Amount]
    SubmitClosing --> CalcVariance[Compute Expected Cash vs Actual Count]
    CalcVariance --> CheckVariance{Variance = 0?}
    CheckVariance -- Yes --> CloseNormal[Mark Shift CLOSED: Balanced]
    CheckVariance -- No --> LogDiscrepancy[Log Over/Short Variance with Audit Reason]
    LogDiscrepancy --> CloseWithFlag[Mark Shift CLOSED: Discrepancy Flagged]
    CloseNormal & CloseWithFlag --> PrintShiftSummary[Print Z-Report Settlement Summary]
```
