const express = require('express');
const mercadopago = require('mercadopago');

const router = express.Router();

// Configurar MercadoPago con tu Access Token
mercadopago.configure({
  access_token: "TU_ACCESS_TOKEN"
});

// Endpoint para procesar pagos
router.post('/create-payment', async (req, res) => {
  try {
    const { productos, userEmail } = req.body;

    // Crear la orden de pago en MercadoPago
    let items = productos.map(prod => ({
      title: prod.nombre,
      quantity: prod.quantity,
      currency_id: "COP",
      unit_price: prod.precio
    }));

    let preference = {
      items,
      payer: {
        email: userEmail
      },
      back_urls: {
        success: "http://localhost:3000/payment-success",
        failure: "http://localhost:3000/payment-failure"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ url: response.body.init_point }); // Enviar URL de pago al frontend
  } catch (error) {
    console.error("❌ Error al procesar el pago:", error);
    res.status(500).json({ error: "Error al generar pago" });
  }
});

router.get('/payment-success', async (req, res) => {
    try {
      const { payment_id, status, merchant_order_id } = req.query;
  
      if (status === "approved") {
        console.log(`✅ Pago exitoso: ${payment_id}, Orden: ${merchant_order_id}`);
  
        // Aquí puedes guardar la orden en tu base de datos
  
        res.send("✅ Pago recibido correctamente. ¡Gracias por tu compra!");
      } else {
        res.send("❌ Pago no aprobado. Inténtalo nuevamente.");
      }
    } catch (error) {
      console.error("❌ Error en confirmación de pago:", error);
      res.status(500).send("❌ Error al procesar el pago.");
    }
  });

module.exports = router;
