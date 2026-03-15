import mongoose from 'mongoose';

export interface RegistrationDocument extends mongoose.Document {
  name: string;
  email: string;
  stravaId: string;
  commitmentScore: number;
  walletAddress: string;
  hasMadeDeposit: boolean;
  status: "pending" | "confirmed" | "waitlisted";
}

const RegistrationSchema = new mongoose.Schema<RegistrationDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  stravaId: { type: String, required: true },
  commitmentScore: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  hasMadeDeposit: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "waitlisted"], 
    default: "pending" 
  },
}, {
  timestamps: true,
});

// Avoid OverwriteModelError in Next.js Hot Reload
export default mongoose.models.Registration || mongoose.model<RegistrationDocument>('Registration', RegistrationSchema);
