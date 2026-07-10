// AI Controller - Handles predictions and fraud detection
const Transaction = require('../models/Transaction');
const Prediction = require('../models/Prediction');
const FraudAlert = require('../models/FraudAlert');
const Insight = require('../models/Insight');
const axios = require('axios');

// @desc    Get expense prediction for next month
// @route   GET /api/ai/predict
// @access  Private
exports.predictExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get last 12 months of transactions
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: oneYearAgo },
      status: 'Success',
    }).sort({ date: -1 });

    if (transactions.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Not enough transaction history for prediction',
      });
    }

    // Call Python prediction service
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        transactions: transactions.map((t) => ({
          amount: t.amount,
          category: t.category,
          date: t.date,
        })),
      });

      const { predicted_expense, category_predictions, trend, confidence } = response.data;

      // Get current month string
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthString = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

      // Save prediction
      let prediction = await Prediction.findOneAndUpdate(
        { userId, month: monthString },
        {
          userId,
          month: monthString,
          predictedExpense: Math.round(predicted_expense),
          categoryPredictions: category_predictions,
          trend,
          confidence,
        },
        { upsert: true, new: true }
      );

      res.status(200).json({
        success: true,
        prediction,
      });
    } catch (pythonError) {
      // Fallback calculation if Python service is down
      const monthlyData = {};
      transactions.forEach((t) => {
        const month = new Date(t.date).toISOString().slice(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + t.amount;
      });

      const amounts = Object.values(monthlyData).sort((a, b) => a - b);
      const avgExpense = amounts.reduce((a, b) => a + b, 0) / amounts.length;

      res.status(200).json({
        success: true,
        message: 'Using fallback prediction method',
        prediction: {
          predictedExpense: Math.round(avgExpense),
          confidence: 0.7,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Detect fraudulent transactions
// @route   POST /api/ai/detect-fraud
// @access  Private
exports.detectFraud = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent successful transaction history
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: oneMonthAgo },
      status: 'Success',
    }).sort({ date: -1 });

    let alerts = await FraudAlert.find({ userId }).sort({ detectedAt: -1 });

    if (transactions.length < 5) {
      return res.status(200).json({
        success: true,
        message: 'Not enough transaction history for model-based fraud detection',
        alertCount: alerts.length,
        alerts,
      });
    }

    try {
      const response = await axios.post('http://localhost:5000/detect-fraud', {
        transactions: transactions.map((t) => ({
          amount: t.amount,
          category: t.category,
          date: t.date,
          merchant: t.merchant,
        })),
      });

      const { fraud_transactions = [] } = response.data;

      for (const fraudTx of fraud_transactions) {
        const transaction = transactions.find(
          (t) => t.amount === fraudTx.amount && t.merchant === fraudTx.merchant
        );

        if (transaction && !transaction.isFraudulent) {
          transaction.riskScore = fraudTx.risk_score;
          transaction.isFraudulent = true;
          await transaction.save();

          await FraudAlert.create({
            userId,
            transactionId: transaction._id,
            amount: transaction.amount,
            riskScore: fraudTx.risk_score,
            alertMessage: `Unusual transaction of ₹${transaction.amount} detected at ${transaction.merchant}`,
            severity: fraudTx.risk_score > 0.7 ? 'Critical' : 'High',
            reason: fraudTx.reason || 'Anomaly detected',
            status: 'Active',
            detectedAt: new Date(),
          });
        }
      }

      alerts = await FraudAlert.find({ userId }).sort({ detectedAt: -1 });

      return res.status(200).json({
        success: true,
        alertCount: alerts.length,
        alerts,
      });
    } catch (pythonError) {
      const amounts = transactions.map((t) => t.amount).sort((a, b) => a - b);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(
        amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length
      );

      const suspiciousTransactions = transactions.filter((t) => t.amount > mean + 2 * stdDev);

      for (const suspiciousTx of suspiciousTransactions) {
        const transaction = transactions.find(
          (t) => t._id.equals(suspiciousTx._id) && !t.isFraudulent
        );

        if (transaction) {
          transaction.riskScore = 0.55;
          transaction.isFraudulent = true;
          await transaction.save();

          await FraudAlert.create({
            userId,
            transactionId: transaction._id,
            amount: transaction.amount,
            riskScore: 0.55,
            alertMessage: `Suspicious transaction of ₹${transaction.amount} detected at ${transaction.merchant}`,
            severity: 'Medium',
            reason: 'Statistical anomaly detected',
            status: 'Active',
            detectedAt: new Date(),
          });
        }
      }

      alerts = await FraudAlert.find({ userId }).sort({ detectedAt: -1 });

      return res.status(200).json({
        success: true,
        message: 'Using fallback fraud detection method',
        alertCount: alerts.length,
        alerts,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current fraud alerts
// @route   GET /api/ai/fraud-alerts
// @access  Private
exports.getFraudAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const alerts = await FraudAlert.find({ userId }).sort({ detectedAt: -1 });

    res.status(200).json({
      success: true,
      alertCount: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update fraud alert status
// @route   PUT /api/ai/fraud-alerts/:id
// @access  Private
exports.updateFraudAlertStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Active', 'Resolved', 'False Alarm'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Active, Resolved, or False Alarm',
      });
    }

    const alert = await FraudAlert.findOne({ _id: id, userId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Fraud alert not found',
      });
    }

    alert.status = status;
    alert.resolvedAt =
      status === 'Resolved' || status === 'False Alarm' ? new Date() : null;
    await alert.save();

    res.status(200).json({
      success: true,
      alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate AI insights
// @route   GET /api/ai/insights
// @access  Private
exports.generateInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete old insights
    await Insight.deleteMany({ userId });

    // Get current month transactions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthTx = await Transaction.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'Success',
    });

    // Get last month transactions for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthTx = await Transaction.find({
      userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      status: 'Success',
    });

    // Calculate spending by category
    const currentCategorySpending = {};
    const lastCategorySpending = {};

    currentMonthTx.forEach((t) => {
      currentCategorySpending[t.category] = (currentCategorySpending[t.category] || 0) + t.amount;
    });

    lastMonthTx.forEach((t) => {
      lastCategorySpending[t.category] = (lastCategorySpending[t.category] || 0) + t.amount;
    });

    const insights = [];

    // Generate insights for each category
    for (const [category, amount] of Object.entries(currentCategorySpending)) {
      const lastAmount = lastCategorySpending[category] || 0;
      const change = lastAmount > 0 ? ((amount - lastAmount) / lastAmount) * 100 : 0;

      if (change > 20) {
        insights.push({
          userId,
          title: `High ${category} Spending`,
          description: `You spent ${Math.round(change)}% more on ${category} this month.`,
          type: 'Warning',
          category,
          value: Math.round(change),
          priority: 'High',
          actionable: true,
        });
      } else if (change < -20) {
        insights.push({
          userId,
          title: `Great ${category} Savings`,
          description: `You spent ${Math.round(Math.abs(change))}% less on ${category} this month.`,
          type: 'Saving',
          category,
          value: Math.round(Math.abs(change)),
          priority: 'Medium',
          actionable: true,
        });
      }
    }

    // Find best saving opportunity
    const totalSpending = Object.values(currentCategorySpending).reduce((a, b) => a + b, 0);
    const maxCategory = Object.entries(currentCategorySpending).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const maxAmount = currentCategorySpending[maxCategory];
    const savingPotential = Math.round(maxAmount * 0.1); // 10% saving potential

    if (savingPotential > 100) {
      insights.push({
        userId,
        title: 'Saving Opportunity',
        description: `You can save ₹${savingPotential} by reducing ${maxCategory} expenses by 10%.`,
        type: 'Recommendation',
        category: maxCategory,
        value: savingPotential,
        priority: 'High',
        actionable: true,
      });
    }

    // Save all insights
    await Insight.insertMany(insights);

    res.status(200).json({
      success: true,
      insights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get budget recommendations
// @route   GET /api/ai/budget-recommendations
// @access  Private
exports.getBudgetRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get last 3 months transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: threeMonthsAgo },
      status: 'Success',
    });

    // Calculate average spending per category
    const categorySpending = {};
    const categoryCount = {};

    transactions.forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    const recommendations = {};
    for (const [category, amount] of Object.entries(categorySpending)) {
      const avgMonthly = amount / 3;
      const recommendedBudget = Math.round(avgMonthly * 1.1); // 10% buffer
      recommendations[category] = {
        avgMonthly: Math.round(avgMonthly),
        recommendedBudget,
        transactionCount: categoryCount[category],
      };
    }

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
