const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    location: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    leadTrainer: { type: String, default: 'Sunita Sharma' },
    capacity: { type: Number, default: 60 },
    activeBatchesCount: { type: Number, default: 2 },
    contactPhone: { type: String, trim: true },
    establishedYear: { type: Number, default: 2006 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Center', centerSchema);
