const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    paidDate: { type: Date },
    paymentMethod: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
