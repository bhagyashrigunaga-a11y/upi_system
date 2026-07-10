// Transaction Model - Stores all user transactions
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    merchant: {
      type: String,
      required: [true, 'Please provide merchant name'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide transaction amount'],
      min: [1, 'Amount must be at least ₹1'],
    },
    category: {
      type: String,
      enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'],
      default: 'Other',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'],
      default: 'UPI',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Success', 'Pending', 'Failed'],
      default: 'Success',
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    isFraudulent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
TransactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
