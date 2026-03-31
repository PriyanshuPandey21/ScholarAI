import express from 'express';
import StudyPlan from '../models/StudyPlan.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/', protect, async (req, res) => {
  try { res.json(await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', protect, async (req, res) => {
  try {
    const { subject, deadline, notes } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject required' });
    res.status(201).json(await StudyPlan.create({ userId: req.user._id, subject, deadline, notes }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.patch('/:id', protect, async (req, res) => {
  try {
    const item = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    const { done, subject, deadline, notes } = req.body;
    if (done !== undefined) item.done = done;
    if (subject) item.subject = subject;
    if (deadline) item.deadline = deadline;
    if (notes !== undefined) item.notes = notes;
    res.json(await item.save());
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', protect, async (req, res) => {
  try { await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); res.json({ message: 'Deleted' }); } catch (err) { res.status(500).json({ error: err.message }); }
});
export default router;
