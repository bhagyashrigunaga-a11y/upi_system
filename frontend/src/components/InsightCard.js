// Insights Component
import React from 'react';
import './InsightCard.css';

const InsightCard = ({ insight }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      Low: '#27ae60',
      Medium: '#f39c12',
      High: '#e74c3c',
    };
    return colors[priority] || '#3498db';
  };

  const getTypeIcon = (type) => {
    const icons = {
      Spending: '📊',
      Saving: '💰',
      Warning: '⚠️',
      Recommendation: '💡',
    };
    return icons[type] || '📌';
  };

  return (
    <div
      className="insight-card"
      style={{ borderLeftColor: getPriorityColor(insight.priority) }}
    >
      <div className="insight-header">
        <span className="insight-icon">{getTypeIcon(insight.type)}</span>
        <h4 className="insight-title">{insight.title}</h4>
        <span
          className="priority-badge"
          style={{ backgroundColor: getPriorityColor(insight.priority) }}
        >
          {insight.priority}
        </span>
      </div>
      <p className="insight-description">{insight.description}</p>
      {insight.value && (
        <div className="insight-value">
          <strong>Impact:</strong> {insight.value}
          {insight.type === 'Spending' || insight.type === 'Saving' ? '%' : '₹'}
        </div>
      )}
      {insight.actionable && (
        <div className="actionable-tag">Actionable</div>
      )}
    </div>
  );
};

export default InsightCard;
