// Prediction Model - Stores expense predictions
const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String, // Format: "2024-01"
      required: true,
    },
    predictedExpense: {
      type: Number,
      required: true,
    },
    actualExpense: {
      type: Number,
      default: null,
    },
    categoryPredictions: {
      Food: Number,
      Travel: Number,
      Shopping: Number,
      Bills: Number,
      Entertainment: Number,
      Healthcare: Number,
      Education: Number,
      Other: Number,
    },
    trend: {
      type: String,
      enum: ['Increasing', 'Decreasing', 'Stable'],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

PredictionSchema.index({ userId: 1, month: -1 });

module.exports = mongoose.model('Prediction', PredictionSchema);
