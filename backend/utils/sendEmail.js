const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // debe ser una contraseña de aplicación de Google
  }
});

const sendVerificationEmail = async (to, token) => {
  const url = `http://localhost:3001/verify/${token}`;

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