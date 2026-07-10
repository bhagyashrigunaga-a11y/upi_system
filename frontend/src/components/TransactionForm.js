// Transaction Form Component
import React, { useState } from 'react';
import './TransactionForm.css';

const TransactionForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    paymentMethod: 'UPI',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.merchant && formData.amount) {
      onSubmit(formData);
      setFormData({
        merchant: '',
        amount: '',
        paymentMethod: 'UPI',
        description: '',
      });
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h3>Add New Transaction</h3>
      
      <div className="form-group">
        <label htmlFor="merchant">Merchant Name</label>
        <input
          type="text"
          id="merchant"
          name="merchant"
          value={formData.merchant}
          onChange={handleChange}
          placeholder="e.g., Swiggy, Uber, Amazon"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount (₹)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Enter amount"
          step="0.01"
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="paymentMethod">Payment Method</label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="UPI">UPI</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Net Banking">Net Banking</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add notes"
          rows="2"
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
};

export default TransactionForm;
