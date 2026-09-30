# Implementation Plan — Phase 6: Production Payment Architecture & Order State Management

## 1. Objectives & Scope
Transform the NOIR checkout and order architecture into a production-ready, multi-gateway system supporting:
1. **CARD (Credit/Debit)** via Wompi Sandbox/Production
2. **NEQUI** via Wompi Sandbox/Production
3. **BRE-B / LLAVE** via Assisted/Verified Colombian interoperable payment flow
4. **CASH ON DELIVERY (Contra entrega)** restricted to Bogotá D.C. as an internal NOIR method

The backend acts as the single source of truth for all pricing, stock, transaction references, integrity signatures, and order/payment states. The frontend is never trusted to confirm a payment.

---

## 2. Architecture & Components

```
                      NOIR CHECKOUT (Frontend)
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
  [CARD]                      [NEQUI]                   [BRE-B / LLAVE]         [CONTRA ENTREGA]
     │                           │                           │                         │
     └─────────────┬─────────────┘                           │                         │
                   ▼                                         │                         │
            Wompi Gateway                                    │                         │
         (Widget / Checkout)                                 │                         │
                   │                                         │                         │
       POST /api/payments/wompi/webhook                      │                         │
                   │                                         │                         │
                   ▼                                         ▼                         ▼
            NOIR BACKEND                                NOIR BACKEND              NOIR BACKEND
     - Verify signature & checksum                  - Assisted proof           - Internal Bogotá
     - Idempotent transaction verification            submission                 delivery
     - Server authoritative stock & totals          - Manual verification      - Payment on arrival
                   │                                         │                         │
                   └─────────────────────────┬───────────────┴─────────────────────────┘
                                             ▼
                                     MongoDB Order Model
                              - Human-readable orderNumber
                              - paymentStatus & orderStatus
                              - paymentAuditTrail
                              - Atomic stock management
                                             │
                   ┌─────────────────────────┴─────────────────────────┐
                   ▼                                                   ▼
            PDF Invoice (PDFKit)                            WhatsApp & Email (Nodemailer)
        - Only marked PAID if APPROVED                  - Accurately states payment status
```

---

## 3. Step-by-Step Execution Plan

### Step 1: Data Model & Counter Architecture
- Create `backend/models/Counter.js` for atomic, sequential, collision-free order numbers (`NOIR-YYYY-XXXXXX`).
- Upgrade `backend/models/Order.js`:
  - Add `orderNumber` (indexed, unique).
  - Add `paymentMethod` (`CARD`, `NEQUI`, `BREB`, `CASH_ON_DELIVERY`, with backward-compatibility aliases).
  - Add `paymentProvider` (`WOMPI`, `MANUAL_BREB`, `NONE`).
  - Add `paymentStatus` (`PENDING`, `PROCESSING`, `APPROVED`, `DECLINED`, `FAILED`, `VOIDED`, `REFUNDED`, `EXPIRED`).
  - Add `orderStatus` (`PENDING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - Add `paymentReference`, `paymentTransactionId`, `paymentProviderReference`, `paymentAmount`, `paymentCurrency`, `paymentMethodType`, `paymentStatusMessage`, `paidAt`, `paymentExpiresAt`, `stockReserved`, `stockReleased`, `brebReference`, `brebProof`, `brebVerifiedAt`, `paymentAuditTrail`.
  - Maintain indexes on `orderNumber`, `paymentReference`, `paymentTransactionId`, `userId`, `paymentStatus`, `orderStatus`.

### Step 2: Wompi & Payment Backend Service
- Create `backend/services/wompiService.js`:
  - Configuration manager (sandbox vs production).
  - Integrity signature generation (`SHA256(reference + amountInCents + currency + integritySecret)`).
  - Webhook event checksum verification (`properties` values concatenation + `timestamp` + `eventsSecret`).
  - Direct transaction status verification against Wompi API (`GET /transactions/:id`).
- Create `backend/services/stockService.js`:
  - Idempotent stock release for expired/declined/cancelled orders.
  - Safe compensation preventing double-decrement or negative stock.

### Step 3: Payment Routes & Webhook Handling
- Create `backend/routes/paymentRoutes.js`:
  - `POST /api/payments/wompi/create`: Prepares Wompi transaction for a validated order, generates unique payment reference, calculates integrity signature, and returns safe public checkout data.
  - `POST /api/payments/wompi/webhook`: Validates event structure and checksum, fetches transaction from Wompi, verifies amount/currency/reference, transitions payment & order status idempotently, releases stock if declined/expired, updates audit trail.
  - `GET /api/payments/:orderId`: Returns authoritative payment and order status for the frontend.
  - `POST /api/payments/breb/submit-proof`: Submits customer transfer reference/voucher for manual Bre-B review without setting `APPROVED`.
  - `POST /api/payments/breb/verify/:orderId`: Admin/manual verification endpoint that safely transitions Bre-B payment to `APPROVED` and order to `CONFIRMED`.
- Mount in `backend/server.js`.

### Step 4: Frontend Payment Integration & Checkout Redesign
- Update `frontend/src/api/api.js`:
  - Add `createWompiPayment`, `getPaymentStatus`, `submitBrebProof`.
- Update `frontend/src/pages/Checkout.js`:
  - Redesign payment selector into 4 distinct NOIR methods:
    1. `CARD` (Crédito / Débito vía Wompi)
    2. `NEQUI` (Pago seguro vía Wompi)
    3. `BREB` (Bre-B / Llave interoperable con copia rápida y comprobante)
    4. `CASH_ON_DELIVERY` (Contra entrega exclusivo Bogotá D.C.)
  - Open Wompi Widget or fallback to Wompi Web Checkout URL.
  - Show Bre-B transfer modal / instructions with official Llave, amount, and reference submission.
- Create payment status pages:
  - `frontend/src/pages/PaymentStatus.js` mounted on `/payment/success`, `/payment/pending`, `/payment/failed` which queries the backend for authoritative status.
- Update `frontend/src/pages/Orders.js` with order number, payment badges, and retry action.
- Update `frontend/src/styles/checkout.css`.

### Step 5: Invoices, Emails & WhatsApp Harmonization
- Update `backend/utils/generateInvoicePDF.js` to display real payment status and order number.
- Update `backend/routes/invoiceRoutes.js`.
- Update WhatsApp message generation to strictly distinguish between `PAGADO`, `CONTRA ENTREGA PENDIENTE`, and `BRE-B PENDIENTE DE VERIFICACIÓN`.

### Step 6: Testing & Verification
- Unit & integration tests for:
  - Webhook checksum calculation & rejection of tampered events.
  - Webhook idempotency (duplicate events do not re-process or double-release).
  - State machine transitions (no accidental reversal of `APPROVED`).
  - Cash on delivery isolation (never triggers Wompi).
  - Bre-B assisted verification (no auto-approval).
  - Stock compensation on payment failure/expiration.
- Full `npm run build` in `frontend` ensuring 0 errors and 0 warnings.
- Documentation: Create `docs/PAYMENTS.md` and `.env.example`.
- Git commit: `feat(phase-6): production payment integration and order state management`.
- Detailed Phase 6 report covering all 22 required items.
