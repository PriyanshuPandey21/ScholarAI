import mongoose from 'mongoose';
const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  deadline: { type: Date },
  notes: { type: String, default: '' },
  done: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('StudyPlan', studyPlanSchema);
