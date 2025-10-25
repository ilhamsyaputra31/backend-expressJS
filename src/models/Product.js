import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    sku:   { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', sku: 'text' });

export default mongoose.model('Product', productSchema);
