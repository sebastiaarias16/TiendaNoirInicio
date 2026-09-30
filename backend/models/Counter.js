const mongoose = require('mongoose');

/**
 * Atomic Counter Schema
 * Ensures collision-free, strictly sequential human-readable identifiers
 * (e.g., NOIR-2026-000001) even under concurrent order creation.
 */
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', CounterSchema);
