import mongoose from 'mongoose';
const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toolUsed: { type: String, required: true },
  inputSummary: { type: String, default: '' },
  resultSummary: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('History', historySchema);
