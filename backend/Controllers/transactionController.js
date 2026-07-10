
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const FraudAlert = require('../models/FraudAlert');
const axios = require('axios');

const AI_MODEL_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

const categorizeMerchant = (merchant) => {
  const merchantLower = merchant.toLowerCase();

  const categories = {
    Food: ['swiggy', 'zomato', 'restaurant', 'cafe', 'pizza', 'burger', 'food', 'mcdonalds', 'kfc', 'dominos'],
    Travel: ['uber', 'ola', 'metro', 'railway', 'bus', 'travel', 'flight', 'taxi', 'auto'],
    Shopping: ['amazon', 'flipkart', 'mall', 'store', 'shop', 'retail', 'myntra', 'ajio', 'bigbasket'],
    Bills: ['bescom', 'electricity', 'water', 'telephone', 'mobile', 'internet', 'gas', 'bills'],
    Entertainment: ['movie', 'cinema', 'theater', 'gaming', 'music', 'spotify', 'netflix', 'prime'],
    Healthcare: ['hospital', 'doctor', 'clinic', 'pharmacy', 'medical', 'health'],
    Education: ['school', 'college', 'university', 'course', 'class', 'tuition', 'institute'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (merchantLower.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
};

// @desc    Categorize merchant using AI model with fallback to local function
// @access  Private
const categorizeMerchantWithAI = async (merchant) => {
  try {
    const response = await axios.post(`${AI_MODEL_URL}/categorize`, {
      merchant,
    });
    return response.data.category || categorizeMerchant(merchant);
  } catch (error) {
    console.warn('AI model categorization failed, using local fallback:', error.message);
    return categorizeMerchant(merchant);
  }
};

// @desc    Detect fraud using AI model
// @access  Private
const detectFraudWithAI = async (userId, transaction) => {
  try {
    const amountValue = Number(transaction.amount);
    const isHighValue = amountValue >= 50000;
    if (isHighValue) {
      return {
        isFraud: true,
        alerts: ['High value transaction detected'],
      };
    }

    // Get last month transactions for fraud detection context
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentTransactions = await Transaction.find({
      userId,
      date: { $gte: oneMonthAgo },
      status: 'Success',
    }).sort({ date: -1 });

    // Call AI model fraud detection if we have enough history
    let fraudTransactions = [];
    let alerts = [];

    if (recentTransactions.length >= 5) {
      const response = await axios.post(`${AI_MODEL_URL}/detect-fraud`, {
        transactions: recentTransactions.map((t) => ({
          amount: t.amount,
          category: t.category,
          date: t.date,
          merchant: t.merchant,
        })),
      });

      fraudTransactions = response.data.fraud_transactions || [];
      alerts = response.data.alerts || [];
    }

    const isFraud = fraudTransactions.length > 0;
    return { isFraud, alerts };
  } catch (error) {
    console.warn('AI model fraud detection failed:', error.message);
    return {
      isFraud: Number(transaction.amount) >= 50000,
      alerts: Number(transaction.amount) >= 50000 ? ['High value transaction detected'] : [],
    };
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { merchant, amount, paymentMethod, description } = req.body;
    const amountValue = Number(amount);

    if (!merchant || !amountValue || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid merchant name and amount',
      });
    }

    // Step 1: Auto-categorize using AI model with fallback
    const category = await categorizeMerchantWithAI(merchant);

    // Step 2: Create transaction object
    const transactionData = {
      userId: req.user.id,
      merchant,
      amount: amountValue,
      category,
      paymentMethod: paymentMethod || 'UPI',
      description: description || '',
      date: new Date(),
      status: 'Success',
      isFraudulent: false,
      riskScore: 0,
    };

    // Step 3: Detect fraud using AI model
    const fraudDetection = await detectFraudWithAI(req.user.id, transactionData);

    // Step 4: Save transaction to database
    let transaction = await Transaction.create(transactionData);

    // Step 5: Handle fraud alerts if detected
    let fraudAlertRecord = null;
    if (fraudDetection.isFraud) {
      await Transaction.findByIdAndUpdate(transaction._id, {
        isFraudulent: true,
        riskScore: 0.8,
      });
      transaction.isFraudulent = true;
      transaction.riskScore = 0.8;

      fraudAlertRecord = await FraudAlert.create({
        userId: req.user.id,
        transactionId: transaction._id,
        amount,
        riskScore: 0.8, // High risk score for AI-detected fraud
        alertMessage: fraudDetection.alerts.join('; ') || 'Suspicious transaction pattern detected',
        reason: fraudDetection.alerts.join('; ') || 'Suspicious transaction pattern detected',
        status: 'Active',
        severity: 'High',
        detectedAt: new Date(),
      });

      console.log('🚨 FRAUD ALERT DETECTED:', {
        transactionId: transaction._id,
        merchant,
        amount,
        reason: fraudAlertRecord.reason,
      });
    }

    // Step 6: Update user total spending
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { totalSpending: amount } },
      { new: true }
    );

    // Step 7: Return response
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction,
        fraudAlert: fraudAlertRecord,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;

    let filter = { userId: req.user.id };

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get transaction stats
// @route   GET /api/transactions/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    // Get current month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Calculate category-wise spending
    const categorySpending = {};
    let totalSpending = 0;

    monthlyTransactions.forEach((tx) => {
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
      totalSpending += tx.amount;
    });

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      userId: req.user.id,
    })
      .sort({ date: -1 })
      .limit(5);

    // Get all transactions for average calculation
    const allTransactions = await Transaction.find({
      userId: req.user.id,
    });

    const averageTransaction = allTransactions.length > 0
      ? allTransactions.reduce((sum, tx) => sum + tx.amount, 0) / allTransactions.length
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        monthlySpending: totalSpending,
        categorySpending,
        recentTransactions,
        averageTransaction: Math.round(averageTransaction),
        transactionCount: monthlyTransactions.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Check ownership
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this transaction',
      });
    }

    const oldAmount = transaction.amount;
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update user total spending
    const amountDifference = transaction.amount - oldAmount;
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { totalSpending: amountDifference } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Check ownership
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this transaction',
      });
    }

    // Update user total spending
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { totalSpending: -transaction.amount } },
      { new: true }
    );

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
