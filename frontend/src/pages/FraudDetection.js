// Fraud Detection Page
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import FraudAlertComponent from '../components/FraudAlert';
import { aiAPI } from '../services/api';
import './FraudDetection.css';

const FraudDetection = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Active');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await aiAPI.getFraudAlerts();
        setAlerts(response.data.alerts || []);
      } catch (error) {
        console.error('Error fetching fraud alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleResolve = async (alertId) => {
    try {
      const response = await aiAPI.updateFraudAlertStatus(alertId, 'Resolved');
      const updatedAlert = response.data.alert;
      setAlerts(
        alerts.map((alert) =>
          alert._id === alertId ? updatedAlert : alert
        )
      );
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const filteredAlerts = alerts.filter((alert) => alert.status === filter);

  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;
  const highCount = alerts.filter((a) => a.severity === 'High').length;
  const activeCount = alerts.filter((a) => a.status === 'Active').length;

  if (loading) {
    return <div className="loading">Loading fraud detection...</div>;
  }

  return (
    <>
      <Navigation />
      <div className="fraud-container">
        <h1>🔒 Fraud Detection & Security</h1>

        {/* Alert Summary */}
        <div className="alert-summary">
          <div className="summary-card critical">
            <h4>Critical Alerts</h4>
            <p>{criticalCount}</p>
          </div>
          <div className="summary-card high">
            <h4>High Risk</h4>
            <p>{highCount}</p>
          </div>
          <div className="summary-card active">
            <h4>Active Alerts</h4>
            <p>{activeCount}</p>
          </div>
          <div className="summary-card total">
            <h4>Total Alerts</h4>
            <p>{alerts.length}</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'Active' ? 'active' : ''}`}
            onClick={() => setFilter('Active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === 'Resolved' ? 'active' : ''}`}
            onClick={() => setFilter('Resolved')}
          >
            Resolved
          </button>
          <button
            className={`filter-btn ${filter === 'False Alarm' ? 'active' : ''}`}
            onClick={() => setFilter('False Alarm')}
          >
            False Alarms
          </button>
        </div>

        {/* Alerts List */}
        <div className="alerts-list">
          {filteredAlerts.length === 0 ? (
            <div className="no-alerts">
              <p>✓ No {filter.toLowerCase()} alerts found</p>
              <p>Your account appears to be secure!</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <FraudAlertComponent
                key={alert._id}
                alert={alert}
                onResolve={handleResolve}
                loading={loading}
              />
            ))
          )}
        </div>

        {/* Security Tips */}
        <div className="security-tips">
          <h2>🛡️ Security Best Practices</h2>
          <ul>
            <li>Never share your UPI PIN or password with anyone</li>
            <li>Use strong passwords (mix of letters, numbers, symbols)</li>
            <li>Enable 2-factor authentication on all accounts</li>
            <li>Verify merchant details before confirming transactions</li>
            <li>Monitor your account regularly for unusual activity</li>
            <li>Report suspicious transactions immediately</li>
            <li>Keep your device and apps updated with latest security patches</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default FraudDetection;
