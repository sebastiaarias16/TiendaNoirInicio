# NOIR Ecommerce — Architecture & Payments Documentation (Phase 6)
*"THE NEW STANDARD. BUILT FOR THOSE WHO EVOLVE."*

---

## 1. Overview
NOIR is an independent Colombian premium fitness and streetwear brand. In Phase 6, the checkout and order architecture was transformed into a robust, multi-gateway, server-authoritative payment system supporting:

1. **CARD (Credit & Debit)** via **Wompi** (Bancolombia)
2. **NEQUI** via **Wompi**
3. **BRE-B / LLAVE** via Assisted & Verified Interoperable Transfer
4. **CASH ON DELIVERY (Contra Entrega)** restricted to **Bogotá D.C.** as an internal NOIR method

The backend acts as the single source of truth for all pricing, stock, transaction references, integrity signatures, and order/payment states. The frontend is never trusted to confirm a payment.

---

## 2. Supported Payment Methods & Flows

### A. CARD (Credit / Debit via Wompi)
- **Customer Experience:** Customer selects "Tarjeta de Crédito / Débito".
- **Execution:**
  1. Frontend submits order with `{ paymentMethod: 'CARD', products, ... }`.
  2. Backend validates stock atomically, calculates server-authoritative total, generates unique `orderNumber` (`NOIR-YYYY-XXXXXX`), and persists order with `orderStatus: 'PENDING_PAYMENT'`, `paymentStatus: 'PENDING'`.
  3. Frontend calls `POST /api/payments/wompi/create`. Backend generates a unique reference (`NOIR-YYYY-XXXXXX-TIMESTAMP`), calculates SHA256 integrity signature, and returns safe public parameters.
  4. Wompi Widget opens programmatically in the browser. If blocked or unavailable, redirects cleanly to the official hosted Web Checkout URL.
  5. Sensitive card information is entered directly into Wompi's PCI-DSS compliant infrastructure. NOIR never sees or stores raw card data.
  6. Wompi processes payment and fires a signed webhook to `POST /api/payments/wompi/webhook`.
  7. Backend verifies webhook checksum, fetches authoritative transaction from Wompi API, transitions order to `orderStatus: 'CONFIRMED'` and `paymentStatus: 'APPROVED'`, triggers PDF invoice, and dispatches confirmation email.

### B. NEQUI (Direct Transfer via Wompi)
- **Customer Experience:** Customer selects "Nequi".
- **Execution:** Processed through Wompi's official Nequi flow. Customer approves push notification on their phone.
- Webhook confirms `APPROVED`, transitioning order to confirmed status identically to the card flow.

### C. BRE-B / LLAVE (Interoperable Colombian System)
- **Colombian Context:** Bre-B is the national interoperable system enabling immediate person-to-person and person-to-business payments via registered *Llaves* across all Colombian banks (Bancolombia, Nequi, Davivienda, Nu, etc.).
- **Integration Realism:** As of current Wompi official documentation, Bre-B is not a standard automated gateway API type. NOIR avoids fake endpoints and implements an authentic **assisted & verified** flow:
  1. Customer selects "Bre-B / Llave".
  2. Order is created with `paymentMethod: 'BREB'`, `paymentProvider: 'MANUAL_BREB'`, `paymentStatus: 'PENDING'`, `orderStatus: 'PENDING_PAYMENT'`.
  3. Customer is presented with NOIR's registered Llaves:
     - **Llave Celular:** `3124252861`
     - **Llave Correo:** `contacto@tiendanoir.com`
     - Exact COP total to transfer.
  4. Customer transfers and optionally enters their voucher/approval number.
  5. Customer clicks "Ya realicé la transferencia", triggering `POST /api/payments/breb/submit-proof`.
  6. **Security Constraint:** Submitting proof **NEVER** auto-approves the order. The order remains `PENDING` until an administrator verifies the bank credit via `POST /api/payments/breb/verify/:orderId`.
  7. Upon admin approval, payment becomes `APPROVED` and order becomes `CONFIRMED`.

### D. CASH ON DELIVERY (Contra Entrega en Bogotá D.C.)
- **Policy:** Available exclusively within Bogotá D.C.
- **Execution:**
  1. Order is created with `paymentMethod: 'CASH_ON_DELIVERY'`, `paymentProvider: 'NONE'`, `orderStatus: 'CONFIRMED'`, `paymentStatus: 'PENDING'`.
  2. Stock is reserved atomically in MongoDB.
  3. Customer receives order confirmation screen with human-readable order number (e.g. `#NOIR-2026-000001`) and direct link to WhatsApp for dispatch coordination.
  4. Upon delivery and payment collection, order transitions to `paymentStatus: 'APPROVED'` and `orderStatus: 'DELIVERED'`.
  5. Never invokes Wompi.

---

## 3. Order & Payment State Machine

```
      [ Payment Created ]
              │
              ▼
         PENDING (Stock Reserved)
              │
     ┌────────┼─────────────────────────┐
     │        │                         │
  Wompi    Wompi                     Timeout
 APPROVED  DECLINED / ERROR          or Expired
     │        │                         │
     │        ▼                         ▼
     │     DECLINED / FAILED         EXPIRED
     │     (Stock Released)       (Stock Released)
     ▼
  APPROVED (CONFIRMED)
  (Invoice & Email Dispatched)
```

| Payment Status | Order Status | Stock Reserved | Stock Released | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `PENDING` | `PENDING_PAYMENT` | Yes | No | Order registered, awaiting customer completion in gateway or transfer. |
| `PROCESSING` | `PENDING_PAYMENT` | Yes | No | Bank is validating biometric or OTP approval. |
| `APPROVED` | `CONFIRMED` | Yes | No | Payment authoritatively validated by gateway. Invoice generated. |
| `DECLINED` | `PENDING_PAYMENT` | No | Yes | Payment rejected by bank. Stock immediately returned to catalog. |
| `FAILED` | `PENDING_PAYMENT` | No | Yes | Network or gateway technical failure. Stock returned. |
| `EXPIRED` | `CANCELLED` | No | Yes | Customer abandoned checkout after 30 mins (online) or 2h (Bre-B). Stock returned. |

---

## 4. Webhook Security & Idempotency

### Webhook Endpoint:
`POST /api/payments/wompi/webhook`

### Checksum Verification Algorithm:
1. Extract properties listed in `event.signature.properties` (e.g. `transaction.id`, `transaction.status`, `transaction.amount_in_cents`).
2. Concatenate values in array order.
3. Append `event.timestamp`.
4. Append `WOMPI_EVENTS_SECRET`.
5. Calculate SHA256 hex hash.
6. Verify against `event.signature.checksum`. If tampered, returns `HTTP 401 Unauthorized`.

### Idempotency Guarantee:
- If Wompi delivers duplicate events for the same transaction:
  - If order is already `APPROVED`, returns `HTTP 200 OK` with zero duplicate side effects (no duplicate emails, invoices, or stock alterations).
  - If order is already `DECLINED` or `EXPIRED`, `stockReleased: true` prevents double-incrementing inventory.

---

## 5. Environment Variables & Setup

### Required Variables (`backend/.env`):
```bash
# Wompi Environment: 'sandbox' or 'production'
WOMPI_ENVIRONMENT=sandbox

# Public Key (Browser / Widget)
WOMPI_PUBLIC_KEY=pub_stagtest_...

# Private Key (Backend API only)
WOMPI_PRIVATE_KEY=prv_stagtest_...

# Integrity Secret (Backend signature generation)
WOMPI_INTEGRITY_SECRET=stagtest_integrity_...

# Events Secret (Backend webhook verification)
WOMPI_EVENTS_SECRET=stagtest_events_...

# Application URLs
FRONTEND_URL=http://localhost:3000
```

### Production Deployment Steps:
1. Set `WOMPI_ENVIRONMENT=production`.
2. Populate `WOMPI_PUBLIC_KEY` (`pub_prod_...`), `WOMPI_PRIVATE_KEY` (`prv_prod_...`), `WOMPI_INTEGRITY_SECRET` (`prod_integrity_...`), and `WOMPI_EVENTS_SECRET` (`prod_events_...`).
3. In Wompi Merchant Dashboard:
   - Configure **URL de Eventos (Webhook)**: `https://your-api-domain.com/api/payments/wompi/webhook`
   - Configure **URL de Redirección**: `https://your-frontend-domain.com/payment/status`
4. Ensure backend is deployed with HTTPS enabled.

---

## 6. Testing & Automated Verification
The repository includes a dedicated test runner verifying the payment state machine:
```bash
node backend/tests/paymentIntegrity.test.js
```
**Tests Covered:**
1. Wompi integrity signature SHA256 calculation
2. Webhook checksum verification for authentic events
3. Webhook checksum rejection on payload tampering
4. Web checkout URL generation without secret leakage
5. Webhook idempotency on duplicate `APPROVED` events
6. Inability to downgrade `APPROVED` transactions to `PENDING`
7. Isolation of Cash on Delivery from online gateways
8. Inability for Bre-B proofs to auto-approve without admin verification
9. Stock compensation idempotency (preventing double inventory release)
10. Amount & currency mismatch rejection
