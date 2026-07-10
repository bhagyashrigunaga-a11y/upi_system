// Transaction Routes
const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getStats,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// All transaction routes require authentication
router.use(protect);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/stats/monthly', getStats);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
