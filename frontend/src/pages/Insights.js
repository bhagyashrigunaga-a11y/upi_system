// Insights Page
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import InsightCard from '../components/InsightCard';
import { aiAPI } from '../services/api';
import './Insights.css';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [insightsRes, recRes] = await Promise.all([
          aiAPI.generateInsights(),
          aiAPI.getBudgetRecommendations(),
        ]);

        setInsights(insightsRes.data.insights);
        setRecommendations(recRes.data.recommendations);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return <div className="loading">Loading insights...</div>;
  }

  return (
    <>
      <Navigation />
      <div className="insights-container">
        <h1>💡 AI Insights & Recommendations</h1>

        {/* Insights Section */}
        <div className="insights-section">
          <h2>Generated Insights</h2>
          {insights.length === 0 ? (
            <p className="no-insights">No insights available yet. Add more transactions to get insights.</p>
          ) : (
            <div className="insights-list">
              {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          )}
        </div>

        {/* Budget Recommendations */}
        {recommendations && (
          <div className="recommendations-section">
            <h2>Budget Recommendations</h2>
            <div className="recommendations-grid">
              {Object.entries(recommendations).map(([category, data]) => (
                <div key={category} className="recommendation-card">
                  <h4>{category}</h4>
                  <div className="rec-item">
                    <label>Average Monthly:</label>
                    <span className="rec-value">₹{data.avgMonthly}</span>
                  </div>
                  <div className="rec-item">
                    <label>Recommended Budget:</label>
                    <span className="rec-value budget">₹{data.recommendedBudget}</span>
                  </div>
                  <div className="rec-item">
                    <label>Transactions:</label>
                    <span className="rec-value">{data.transactionCount}</span>
                  </div>
                  <div className="budget-bar">
                    <div
                      className="budget-fill"
                      style={{
                        width: `${Math.min((data.avgMonthly / data.recommendedBudget) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="tips-section">
          <h2>💰 Money Saving Tips</h2>
          <ul className="tips-list">
            <li>Track your spending regularly and review it weekly</li>
            <li>Set budget limits for each spending category</li>
            <li>Use UPI for secure and traceable transactions</li>
            <li>Cashback and rewards programs can help reduce expenses</li>
            <li>Plan large purchases to avoid impulse spending</li>
            <li>Keep an emergency fund with 3-6 months of expenses</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Insights;
