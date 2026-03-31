import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const generateToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'scholarai-secret', { expiresIn: '7d' });

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  (req, res) => res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login/callback?token=${generateToken(req.user)}`)
);
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  (req, res) => res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login/callback?token=${generateToken(req.user)}`)
);
router.get('/me', protect, (req, res) => res.json({ user: req.user }));
router.post('/logout', (req, res) => res.json({ message: 'Logged out' }));

export default router;
