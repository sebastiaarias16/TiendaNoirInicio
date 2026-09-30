const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // debe ser una contraseña de aplicación de Google
  }
});

const sendVerificationEmail = async (to, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const url = `${frontendUrl}/verify/${token}`;

  await transporter.sendMail({
    from: '"Noir" <no-reply@noir.com>',
    to,
    subject: 'Verifica tu cuenta en Noir 🖤',
    html: `
      <h3>Bienvenido a Noir</h3>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${url}">Verificar cuenta</a>
    `
  });
};

module.exports = sendVerificationEmail;