// Transaction List Component
import React from 'react';
import './TransactionList.css';

const TransactionList = ({ transactions, onDelete, loading }) => {
  const getCategoryColor = (category) => {
    const colors = {
      Food: '#f39c12',
      Travel: '#3498db',
      Shopping: '#e74c3c',
      Bills: '#9b59b6',
      Entertainment: '#1abc9c',
      Healthcare: '#27ae60',
      Education: '#34495e',
      Other: '#95a5a6',
    };
    return colors[category] || '#95a5a6';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="transaction-list">
      <h3>Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="no-transactions">No transactions found</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.merchant}</td>
                  <td>
                    <span
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    >
                      {transaction.category}
                    </span>
                  </td>
                  <td className="amount">₹{transaction.amount.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => onDelete(transaction._id)}
                      className="delete-btn"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
