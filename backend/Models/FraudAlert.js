// FraudAlert Model - Stores fraud detection alerts
const mongoose = require('mongoose');

const FraudAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    alertMessage: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'False Alarm'],
      default: 'Active',
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
    },
    reason: {
      type: String, // e.g., "Anomaly detected", "Unusual pattern"
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

FraudAlertSchema.index({ userId: 1, detectedAt: -1 });

module.exports = mongoose.model('FraudAlert', FraudAlertSchema);
