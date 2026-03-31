import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'scholarai-secret');
    const user = await User.findById(decoded.id).select('-__v');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
};
