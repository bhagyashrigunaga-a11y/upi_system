// Fraud Alert Component
import React from 'react';
import './FraudAlert.css';

const FraudAlert = ({ alert, onResolve, loading }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      Low: '#27ae60',
      Medium: '#f39c12',
      High: '#e74c3c',
      Critical: '#c0392b',
    };
    return colors[severity] || '#95a5a6';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const riskPercentage = Math.round(alert.riskScore * 100);

  return (
    <div className="fraud-alert-container">
      <div className="alert-header">
        <div className="alert-icon" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
          🚨
        </div>
        <div className="alert-info">
          <h4>{alert.alertMessage}</h4>
          <p className="alert-time">{formatDate(alert.detectedAt)}</p>
        </div>
      </div>

      <div className="alert-details">
        <div className="detail-item">
          <label>Amount:</label>
          <span className="amount-badge">₹{alert.amount.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <label>Risk Score:</label>
          <div className="risk-score-bar">
            <div
              className="risk-fill"
              style={{
                width: `${riskPercentage}%`,
                backgroundColor: getSeverityColor(alert.severity),
              }}
            />
          </div>
          <span className="risk-percentage">{riskPercentage}%</span>
        </div>
        <div className="detail-item">
          <label>Severity:</label>
          <span
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(alert.severity) }}
          >
            {alert.severity}
          </span>
        </div>
        <div className="detail-item">
          <label>Reason:</label>
          <span>{alert.reason}</span>
        </div>
      </div>

      {alert.status === 'Active' && (
        <button
          className="resolve-btn"
          onClick={() => onResolve(alert._id)}
          disabled={loading}
        >
          Mark as Resolved
        </button>
      )}
    </div>
  );
};

export default FraudAlert;
