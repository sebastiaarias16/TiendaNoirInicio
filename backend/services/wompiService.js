const crypto = require('crypto');
const axios = require('axios');

/**
 * NOIR — Official Wompi Payment Gateway Integration Service
 * Compliant with Wompi API v1 specifications:
 * - Integrity signature generation (SHA256)
 * - Webhook event checksum verification
 * - Server-side direct transaction lookup
 * - Sandbox and Production environment separation
 */

function getWompiConfig() {
  const isProd = process.env.WOMPI_ENVIRONMENT === 'production';
  return {
    isProd,
    publicKey: process.env.WOMPI_PUBLIC_KEY || '',
    privateKey: process.env.WOMPI_PRIVATE_KEY || '',
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET || '',
    eventsSecret: process.env.WOMPI_EVENTS_SECRET || '',
    apiBaseUrl:
      process.env.WOMPI_API_BASE_URL ||
      (isProd ? 'https://production.wompi.co/v1' : 'https://sandbox.wompi.co/v1'),
    checkoutBaseUrl:
      process.env.WOMPI_CHECKOUT_BASE_URL || 'https://checkout.wompi.co',
  };
}

/**
 * Generates the official Wompi integrity signature for Web / Widget Checkout:
 * SHA256(reference + amountInCents + currency + integritySecret)
 */
function generateIntegritySignature(reference, amountInCents, currency = 'COP') {
  const config = getWompiConfig();
  if (!config.integritySecret) {
    console.warn('⚠️ WOMPI_INTEGRITY_SECRET no está configurado en .env. La firma no podrá ser validada.');
    return '';
  }

  const rawString = `${reference}${amountInCents}${currency}${config.integritySecret}`;
  return crypto.createHash('sha256').update(rawString, 'utf8').digest('hex');
}

/**
 * Safely resolves nested properties using dot notation (e.g. 'transaction.id' in data)
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

/**
 * Verifies the authenticity of incoming Wompi webhooks using the checksum property:
 * Concatenates all values indicated in signature.properties + timestamp + eventsSecret
 * and compares SHA256 hex hash against signature.checksum.
 */
function verifyWebhookChecksum(eventBody) {
  const config = getWompiConfig();

  if (!eventBody || !eventBody.signature || !eventBody.data) {
    return { valid: false, error: 'Estructura del evento inválida' };
  }

  // If no secret configured in dev/sandbox, log warning but note it
  if (!config.eventsSecret) {
    console.warn('⚠️ WOMPI_EVENTS_SECRET no configurado. Verificación estricta omitida en sandbox.');
    return { valid: true, unverifiedSecret: true };
  }

  const { properties, checksum } = eventBody.signature;
  const timestamp = eventBody.timestamp;

  if (!Array.isArray(properties) || !checksum || !timestamp) {
    return { valid: false, error: 'Propiedades de firma ausentes en el webhook' };
  }

  let concatenated = '';
  for (const propPath of properties) {
    const val = getNestedValue(eventBody.data, propPath);
    if (val === undefined || val === null) {
      return { valid: false, error: `Propiedad no encontrada en datos: ${propPath}` };
    }
    concatenated += String(val);
  }

  concatenated += String(timestamp);
  concatenated += config.eventsSecret;

  const calculatedChecksum = crypto
    .createHash('sha256')
    .update(concatenated, 'utf8')
    .digest('hex');

  const isValid = calculatedChecksum.toLowerCase() === String(checksum).toLowerCase();

  return {
    valid: isValid,
    calculatedChecksum,
    expectedChecksum: checksum,
  };
}

/**
 * Directly queries the authoritative transaction status from Wompi's backend
 * using the private key.
 */
async function fetchTransactionFromWompi(transactionId) {
  const config = getWompiConfig();
  if (!config.privateKey) {
    console.warn('⚠️ WOMPI_PRIVATE_KEY no configurado para consulta directa a Wompi.');
    return null;
  }

  try {
    const url = `${config.apiBaseUrl}/transactions/${transactionId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${config.privateKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Error consultando transacción en Wompi API:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Builds the official Wompi Web Checkout hosted URL as a direct fallback
 */
function buildWebCheckoutUrl({
  publicKey,
  reference,
  amountInCents,
  currency = 'COP',
  integritySignature,
  redirectUrl,
}) {
  const config = getWompiConfig();
  const pub = publicKey || config.publicKey;
  const params = new URLSearchParams({
    'public-key': pub,
    currency,
    'amount-in-cents': String(amountInCents),
    reference,
  });

  if (integritySignature) {
    params.append('signature:integrity', integritySignature);
  }
  if (redirectUrl) {
    params.append('redirect-url', redirectUrl);
  }

  return `${config.checkoutBaseUrl}/p/?${params.toString()}`;
}

module.exports = {
  getWompiConfig,
  generateIntegritySignature,
  verifyWebhookChecksum,
  fetchTransactionFromWompi,
  buildWebCheckoutUrl,
};
