// AI Routes
const express = require('express');
const router = express.Router();
const {
  predictExpense,
  detectFraud,
  getFraudAlerts,
  updateFraudAlertStatus,
  generateInsights,
  getBudgetRecommendations,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

router.get('/predict', predictExpense);
router.post('/detect-fraud', detectFraud);
router.get('/fraud-alerts', getFraudAlerts);
router.put('/fraud-alerts/:id', updateFraudAlertStatus);
router.get('/insights', generateInsights);
router.get('/budget-recommendations', getBudgetRecommendations);

module.exports = router;
