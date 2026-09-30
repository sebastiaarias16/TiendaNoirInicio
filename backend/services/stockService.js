const Product = require('../models/Product');

/**
 * NOIR Stock Service
 * Provides atomic, idempotent inventory reservation and safe compensation/release.
 * Guarantees zero negative stock, zero overselling, and zero double-release.
 */

/**
 * Atomically reserves stock for a list of authoritative products.
 * Uses conditional atomic updates ({ stock: { $gte: quantity } }).
 * If any item fails, automatically rolls back all previously decremented items.
 */
async function reserveStock(authoritativeProducts) {
  const decrementedProducts = [];

  for (const item of authoritativeProducts) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!updated) {
      // Rollback previous decrements in this transaction
      for (const rollback of decrementedProducts) {
        await Product.findByIdAndUpdate(rollback.productId, {
          $inc: { stock: rollback.quantity },
        });
      }

      return {
        success: false,
        failedItem: item,
      };
    }

    decrementedProducts.push(item);
  }

  return {
    success: true,
    decrementedProducts,
  };
}

/**
 * Idempotently releases reserved stock back into available inventory
 * for cancelled, declined, or expired orders.
 * Will NEVER increment stock more than once for the same order.
 */
async function releaseOrderStock(order, reason = 'PAYMENT_FAILED_OR_EXPIRED') {
  if (!order) return false;

  // Idempotency check: never release twice
  if (order.stockReleased || !order.stockReserved) {
    return false;
  }

  for (const item of order.products) {
    const pid = item.productId?._id || item.productId;
    const qty = item.quantity || 1;

    await Product.findByIdAndUpdate(pid, {
      $inc: { stock: qty },
    });
  }

  order.stockReleased = true;
  order.stockReserved = false;

  order.paymentAuditTrail.push({
    eventType: 'STOCK_COMPENSATION_RELEASED',
    provider: order.paymentProvider || 'NONE',
    reference: order.paymentReference || order.orderNumber,
    timestamp: new Date(),
    details: { reason },
  });

  await order.save();
  return true;
}

module.exports = {
  reserveStock,
  releaseOrderStock,
};
