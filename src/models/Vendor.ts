import mongoose from 'mongoose';

export interface VendorDocument extends mongoose.Document {
  name: string;
  serviceType: string;
  payoutMethod: "fiat_card" | "crypto_card" | "wallet";
  payoutAddress: string;
  transactionCount: number;
}

const VendorSchema = new mongoose.Schema<VendorDocument>({
  name: { type: String, required: true },
  serviceType: { type: String, required: true },
  payoutMethod: { 
    type: String, 
    enum: ["fiat_card", "crypto_card", "wallet"], 
    required: true 
  },
  payoutAddress: { type: String, required: true },
  transactionCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export default mongoose.models.Vendor || mongoose.model<VendorDocument>('Vendor', VendorSchema);
