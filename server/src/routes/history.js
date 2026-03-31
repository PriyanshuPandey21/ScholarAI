import express from 'express';
import History from '../models/History.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/', protect, async (req, res) => {
  try {
    const { tool, limit = 50 } = req.query;
    const filter = { userId: req.user._id };
    if (tool) filter.toolUsed = tool;
    res.json(await History.find(filter).sort({ createdAt: -1 }).limit(Number(limit)));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/summary', protect, async (req, res) => {
  try {
    const summary = await History.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$toolUsed', count: { $sum: 1 }, lastUsed: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
    ]);
    res.json(summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
export default router;
