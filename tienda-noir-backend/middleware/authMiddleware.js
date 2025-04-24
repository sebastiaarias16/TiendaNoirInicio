const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ error: 'No hay token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // guardamos solo el ID del usuario
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token no válido' });
  }
};

module.exports = authMiddleware;