const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;


// 🟢 REGISTRO con confirmación
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Verificar si ya existe un usuario
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Ya existe una cuenta con ese correo.' });
  
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Generar token único
      const verificationToken = crypto.randomBytes(32).toString('hex');
  
      // Crear usuario
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        verificationToken
      });
  
      await newUser.save();
  
      // Enviar email de verificación
      await sendVerificationEmail(email, verificationToken);
  
      res.status(201).json({ message: 'Usuario registrado. Revisa tu correo para verificar tu cuenta.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar usuario.' });
    }
  });

// 🟢 Confirmación de cuenta
router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;
  
    try {
      const user = await User.findOne({ verificationToken: token });
  
      if (!user) {
        return res.status(400).json({ error: 'Token inválido o ya verificado' });
      }
  
      user.verified = true;
      user.verificationToken = undefined;
      await user.save();
  
      res.json({ message: '✅ Tu cuenta ha sido verificada exitosamente.' });
    } catch (error) {
      res.status(500).json({ error: '❌ Error al verificar cuenta.' });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
  
      if (!user.verified) {
        return res.status(403).json({ error: 'Debes verificar tu cuenta primero' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });


  router.get('/user', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user).select('-password');
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      res.json(user);
    } catch (err) {
      console.error('Error al obtener el usuario:', err);
      res.status(500).json({ error: 'Error al obtener el usuario' });
    }
  });

module.exports = router;