// utils/sendInvoiceEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInvoiceEmail = async (email, name, pdfPath) => {
  const mailOptions = {
    from: 'Noir 🖤 <noir.tienda@gmail.com>',
    to: email,
    subject: '🖤 Tu factura de Noir ha llegado',
    text: `Hola ${name}, gracias por confiar en nosotros. 🖤
Adjuntamos tu factura de compra.

Recuerda: en Noir creemos que cada prenda es un símbolo de fuerza, elegancia y autenticidad. 
Disfruta tu estilo Noir.

- Equipo Noir`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; padding: 20px;">
        <h2 style="color: #000;">Hola ${name},</h2>
        <p>Gracias por confiar en <b>Noir</b> 🖤. Adjuntamos tu factura de compra.</p>

        <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #000;">
          <p style="margin: 0; font-size: 14px;">
            Recuerda: en <b>Noir</b> creemos que cada prenda es un símbolo de 
            <b>fuerza</b>, <b>elegancia</b> y <b>autenticidad</b>.
          </p>
        </div>

        <p style="font-size: 14px;">Disfruta tu estilo Noir.</p>
        <p style="margin-top: 30px;">🖤 Equipo Noir</p>
      </div>
    `,
    attachments: [
      {
        filename: 'Factura-Noir.pdf',
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendInvoiceEmail;