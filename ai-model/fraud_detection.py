"""
Fraud Detection Model using Isolation Forest
Detects anomalies and unusual transaction patterns
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta

def detect_anomalies(transactions, contamination=0.1):
    """
    Detect fraudulent transactions using Isolation Forest
    
    Args:
        transactions: List of transaction dictionaries
        contamination: Expected proportion of anomalies (default 10%)
    
    Returns:
        Dictionary with fraud detection results
    """
    try:
        if len(transactions) < 5:
            return {
                'fraud_transactions': [],
                'alerts': []
            }
        
        df = pd.DataFrame(transactions)
        
        # Extract features for model
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.dayofweek
        df['hour'] = df['date'].dt.hour if 'date' in df.columns else 12
        
        # Encode categories
        categories = df['category'].unique()
        category_mapping = {cat: i for i, cat in enumerate(categories)}
        df['category_encoded'] = df['category'].map(category_mapping)
        
        # Features for anomaly detection
        features = df[['amount', 'category_encoded', 'day_of_week']].copy()
        
        # Normalize amount (important for anomaly detection)
        mean_amount = features['amount'].mean()
        std_amount = features['amount'].std()
        features['amount_normalized'] = (features['amount'] - mean_amount) / max(std_amount, 1)
        
        # Isolation Forest model
        iso_forest = IsolationForest(
            contamination=min(contamination, 0.5),
            random_state=42,
            n_estimators=100
        )
        
        # Predict anomalies (-1 for outliers, 1 for inliers)
        predictions = iso_forest.fit_predict(features[['amount_normalized', 'category_encoded']])
        anomaly_scores = iso_forest.score_samples(features[['amount_normalized', 'category_encoded']])
        
        # Normalize anomaly scores to 0-1 range
        min_score = anomaly_scores.min()
        max_score = anomaly_scores.max()
        risk_scores = 1 - ((anomaly_scores - min_score) / max(max_score - min_score, 1))
        
        fraud_transactions = []
        
        for idx, (pred, risk_score) in enumerate(zip(predictions, risk_scores)):
            if pred == -1:  # Anomaly detected
                transaction = df.iloc[idx]
                
                # Determine reason for flagging
                reasons = []
                if transaction['amount'] > mean_amount + 2 * std_amount:
                    reasons.append('Unusually high amount')
                if transaction['amount'] < mean_amount - 2 * std_amount:
                    reasons.append('Unusually low amount')
                
                # Check for pattern anomalies
                same_merchant_txns = df[df['merchant'] == transaction['merchant']]
                if len(same_merchant_txns) > 1:
                    merchant_avg = same_merchant_txns['amount'].mean()
                    if abs(transaction['amount'] - merchant_avg) > 2 * same_merchant_txns['amount'].std():
                        reasons.append('Unusual amount for this merchant')
                
                fraud_transactions.append({
                    'merchant': transaction['merchant'],
                    'amount': float(transaction['amount']),
                    'category': transaction['category'],
                    'date': transaction['date'].isoformat(),
                    'risk_score': float(risk_score),
                    'reason': ' | '.join(reasons) if reasons else 'Anomaly detected'
                })
        
        # Sort by risk score
        fraud_transactions.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return {
            'fraud_transactions': fraud_transactions,
            'alerts': len(fraud_transactions)
        }
    
    except Exception as e:
        print(f"Error in fraud detection: {str(e)}")
        return {
            'fraud_transactions': [],
            'alerts': 0
        }

def get_risk_level(risk_score):
    """
    Classify risk level based on score
    """
    if risk_score > 0.8:
        return 'Critical'
    elif risk_score > 0.6:
        return 'High'
    elif risk_score > 0.4:
        return 'Medium'
    else:
        return 'Low'

# For testing
if __name__ == '__main__':
    test_transactions = [
        {'merchant': 'Swiggy', 'amount': 500, 'category': 'Food', 'date': '2024-01-01T10:00:00'},
        {'merchant': 'Uber', 'amount': 300, 'category': 'Travel', 'date': '2024-01-02T14:00:00'},
        {'merchant': 'Amazon', 'amount': 2000, 'category': 'Shopping', 'date': '2024-01-03T15:00:00'},
        {'merchant': 'Swiggy', 'amount': 50000, 'category': 'Food', 'date': '2024-01-04T18:00:00'},  # Anomaly
        {'merchant': 'Restaurant', 'amount': 1200, 'category': 'Food', 'date': '2024-01-05T19:00:00'},
    ]
    result = detect_anomalies(test_transactions)
    print(result)
