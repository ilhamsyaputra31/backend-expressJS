import jwt from 'jsonwebtoken';

export function authGuard(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub }; 
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
