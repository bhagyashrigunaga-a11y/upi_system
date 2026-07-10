// Insight Model - Stores generated AI insights
const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Spending', 'Saving', 'Warning', 'Recommendation'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    category: String,
    value: Number, // Percentage or amount
    actionable: Boolean,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

InsightSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Insight', InsightSchema);
