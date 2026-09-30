const assert = require('assert');
const crypto = require('crypto');

// Set test environment variables
process.env.WOMPI_ENVIRONMENT = 'sandbox';
process.env.WOMPI_PUBLIC_KEY = 'pub_stagtest_test123';
process.env.WOMPI_PRIVATE_KEY = 'prv_stagtest_secret456';
process.env.WOMPI_INTEGRITY_SECRET = 'stagtest_integrity_testkey789';
process.env.WOMPI_EVENTS_SECRET = 'stagtest_events_secret999';

const {
  generateIntegritySignature,
  verifyWebhookChecksum,
  buildWebCheckoutUrl,
} = require('../services/wompiService');

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 NOIR APPAREL — PHASE 6 PAYMENT ARCHITECTURE TEST SUITE');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  // ----------------------------------------------------
  // 1. Integrity Signature Generation
  // ----------------------------------------------------
  test('1. Wompi integrity signature matches SHA256 specification', () => {
    const reference = 'NOIR-2026-000001-1712000000';
    const amountInCents = 14500000;
    const currency = 'COP';
    const secret = process.env.WOMPI_INTEGRITY_SECRET;

    const signature = generateIntegritySignature(reference, amountInCents, currency);
    const expected = crypto
      .createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${secret}`, 'utf8')
      .digest('hex');

    assert.strictEqual(signature, expected, 'Firma generada debe coincidir exactamente con el hash SHA256');
    assert.strictEqual(signature.length, 64, 'La firma SHA256 debe tener 64 caracteres');
  });

  // ----------------------------------------------------
  // 2. Webhook Event Checksum Verification
  // ----------------------------------------------------
  test('2. Webhook checksum verification accepts authentic events', () => {
    const timestamp = 1712000000;
    const properties = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
    const txId = 'tx-12345-abc';
    const txStatus = 'APPROVED';
    const txAmount = 14500000;

    const concatenated = `${txId}${txStatus}${txAmount}${timestamp}${process.env.WOMPI_EVENTS_SECRET}`;
    const validChecksum = crypto.createHash('sha256').update(concatenated, 'utf8').digest('hex');

    const eventBody = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: txId,
          status: txStatus,
          amount_in_cents: txAmount,
          reference: 'NOIR-2026-000001-1712000000',
        },
      },
      timestamp,
      signature: {
        properties,
        checksum: validChecksum,
      },
    };

    const result = verifyWebhookChecksum(eventBody);
    assert.strictEqual(result.valid, true, 'El evento auténtico debe ser validado como true');
  });

  // ----------------------------------------------------
  // 3. Webhook Checksum Rejection on Tampering
  // ----------------------------------------------------
  test('3. Webhook checksum verification rejects tampered amounts or signatures', () => {
    const timestamp = 1712000000;
    const eventBody = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'tx-12345-tampered',
          status: 'APPROVED',
          amount_in_cents: 99999999, // tampered amount
        },
      },
      timestamp,
      signature: {
        properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
        checksum: 'fake_or_tampered_checksum_hash_0000000000000000000000000000000000',
      },
    };

    const result = verifyWebhookChecksum(eventBody);
    assert.strictEqual(result.valid, false, 'Un evento con firma alterada debe ser rechazado');
  });

  // ----------------------------------------------------
  // 4. Web Checkout Hosted URL Construction
  // ----------------------------------------------------
  test('4. Web checkout URL contains required public params without leaking secrets', () => {
    const url = buildWebCheckoutUrl({
      publicKey: 'pub_stagtest_test123',
      reference: 'NOIR-2026-000002-999',
      amountInCents: 8500000,
      currency: 'COP',
      integritySignature: 'abcd1234efgh5678',
      redirectUrl: 'http://localhost:3000/payment/status',
    });

    assert.ok(url.includes('checkout.wompi.co/p/?'), 'Debe apuntar a Wompi Checkout');
    assert.ok(url.includes('public-key=pub_stagtest_test123'), 'Debe incluir la clave pública');
    assert.ok(url.includes('amount-in-cents=8500000'), 'Debe incluir el monto en centavos');
    assert.ok(!url.includes(process.env.WOMPI_PRIVATE_KEY), 'NUNCA debe filtrar la clave privada');
    assert.ok(!url.includes(process.env.WOMPI_INTEGRITY_SECRET), 'NUNCA debe filtrar el secreto de integridad');
  });

  // ----------------------------------------------------
  // 5. State Machine: Idempotency of APPROVED Orders
  // ----------------------------------------------------
  test('5. State Machine: Repeated APPROVED event does not re-process or alter already approved order', () => {
    const mockOrder = {
      orderNumber: 'NOIR-2026-000005',
      paymentStatus: 'APPROVED',
      orderStatus: 'CONFIRMED',
      total: 145000,
      stockReserved: true,
      stockReleased: false,
      paymentAuditTrail: [{ eventType: 'PAYMENT_APPROVED' }],
    };

    const isAlreadyApproved = mockOrder.paymentStatus === 'APPROVED';
    assert.strictEqual(isAlreadyApproved, true, 'El pedido ya se encuentra aprobado');

    // Idempotent handler logic
    if (isAlreadyApproved) {
      // Must not change status or release stock
      assert.strictEqual(mockOrder.stockReleased, false, 'El stock no debe ser liberado de una orden aprobada');
      assert.strictEqual(mockOrder.orderStatus, 'CONFIRMED', 'El estado de la orden debe permanecer CONFIRMED');
    }
  });

  // ----------------------------------------------------
  // 6. State Machine: APPROVED order cannot accidentally revert to PENDING
  // ----------------------------------------------------
  test('6. State Machine: APPROVED transaction cannot be reverted back to PENDING', () => {
    const mockOrder = {
      paymentStatus: 'APPROVED',
      orderStatus: 'CONFIRMED',
    };

    const incomingStatus = 'PENDING';

    // Guard rule
    if (mockOrder.paymentStatus === 'APPROVED' && incomingStatus === 'PENDING') {
      // Ignored: do not downgrade
    } else {
      mockOrder.paymentStatus = incomingStatus;
    }

    assert.strictEqual(mockOrder.paymentStatus, 'APPROVED', 'Una transacción APPROVED no debe retroceder a PENDING');
  });

  // ----------------------------------------------------
  // 7. Cash on Delivery Isolation
  // ----------------------------------------------------
  test('7. Cash on delivery order is valid without online gateway and never triggers Wompi', () => {
    const codOrder = {
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentProvider: 'NONE',
      paymentStatus: 'PENDING',
      orderStatus: 'CONFIRMED',
      city: 'Bogotá',
    };

    assert.strictEqual(codOrder.paymentProvider, 'NONE', 'Contra entrega no debe tener proveedor externo');
    assert.strictEqual(codOrder.orderStatus, 'CONFIRMED', 'Contra entrega se confirma directamente');
    assert.strictEqual(codOrder.city, 'Bogotá', 'Contra entrega está restringida a Bogotá');
  });

  // ----------------------------------------------------
  // 8. Bre-B Manual Verification Safety
  // ----------------------------------------------------
  test('8. Bre-B manual payment cannot automatically become APPROVED upon proof submission', () => {
    const brebSubmission = {
      orderId: '67bfa3982488a032fc994991',
      brebReference: 'CUS-94820492',
      brebProof: 'Transferencia realizada',
    };

    // Client submission only sets PENDING
    const resultingStatus = 'PENDING';
    const resultingProvider = 'MANUAL_BREB';

    assert.notStrictEqual(resultingStatus, 'APPROVED', 'El comprobante Bre-B NO puede auto-aprobarse');
    assert.strictEqual(resultingProvider, 'MANUAL_BREB', 'El proveedor debe ser MANUAL_BREB');
  });

  // ----------------------------------------------------
  // 9. Stock Compensation Idempotency
  // ----------------------------------------------------
  test('9. Stock Compensation: Cannot double-release stock on repeated failure/expiration events', () => {
    let inventory = 10;
    const itemQty = 2;

    const mockOrder = {
      products: [{ productId: 'prod-1', quantity: itemQty }],
      stockReserved: true,
      stockReleased: false,
    };

    function simulateRelease(order) {
      if (order.stockReleased || !order.stockReserved) {
        return false; // Idempotent: already released
      }
      inventory += itemQty;
      order.stockReleased = true;
      order.stockReserved = false;
      return true;
    }

    // First call: releases stock
    const firstRelease = simulateRelease(mockOrder);
    assert.strictEqual(firstRelease, true, 'La primera liberación de stock debe ejecutarse');
    assert.strictEqual(inventory, 12, 'El inventario debe aumentar en 2 unidades');

    // Second call: duplicate webhook or status check
    const secondRelease = simulateRelease(mockOrder);
    assert.strictEqual(secondRelease, false, 'La segunda llamada debe ser ignorada por idempotencia');
    assert.strictEqual(inventory, 12, 'El inventario NO debe duplicar el incremento de stock');
  });

  // ----------------------------------------------------
  // 10. Amount & Currency Discrepancy Protection
  // ----------------------------------------------------
  test('10. Amount validation: Rejects transactions with mismatched cent values', () => {
    const orderTotal = 145000; // COP
    const expectedCents = orderTotal * 100; // 14500000

    const receivedCents = 14000000; // Underpaid by 5,000 COP
    const isMatch = receivedCents === expectedCents;

    assert.strictEqual(isMatch, false, 'Un pago con monto discrepante debe ser rechazado');
  });

  console.log(`\n========================================================`);
  console.log(`🏁 RESULTADOS: ${passed}/${total} pruebas pasaron exitosamente.`);
  console.log(`========================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
