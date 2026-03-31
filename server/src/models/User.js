import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  provider: { type: String, enum: ['google', 'github'], required: true },
  providerId: { type: String, required: true },
}, { timestamps: true });
export default mongoose.model('User', userSchema);
