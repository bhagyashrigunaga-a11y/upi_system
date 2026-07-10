"""
Expense Prediction Model using Linear Regression
Uses historical transaction data to predict future expenses
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from collections import defaultdict

def prepare_data(transactions):
    """
    Prepare transaction data for prediction
    Returns monthly spending data
    """
    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.to_period('M')
    
    monthly_spending = df.groupby('month')['amount'].sum()
    return monthly_spending

def predict_next_month(transactions):
    """
    Predict total expense for next month using Linear Regression
    
    Args:
        transactions: List of transaction dictionaries
    
    Returns:
        Dictionary with prediction data
    """
    try:
        monthly_spending = prepare_data(transactions)
        
        if len(monthly_spending) < 3:
            # Not enough data for regression
            return {
                'predicted_expense': monthly_spending.mean(),
                'confidence': 0.5,
                'trend': 'Unknown',
                'category_predictions': {}
            }
        
        # Convert to numpy arrays for sklearn
        X = np.arange(len(monthly_spending)).reshape(-1, 1)
        y = monthly_spending.values
        
        # Fit linear regression model
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict next month
        next_month_x = np.array([[len(monthly_spending)]])
        predicted_expense = model.predict(next_month_x)[0]
        
        # Calculate trend
        if len(monthly_spending) >= 2:
            recent_trend = (monthly_spending.iloc[-1] - monthly_spending.iloc[-2]) / monthly_spending.iloc[-2]
            if recent_trend > 0.1:
                trend = 'Increasing'
            elif recent_trend < -0.1:
                trend = 'Decreasing'
            else:
                trend = 'Stable'
        else:
            trend = 'Stable'
        
        # Calculate R-squared as confidence score
        r_squared = model.score(X, y)
        confidence = min(max(r_squared, 0), 1)
        
        # Predict by category
        df = pd.DataFrame(transactions)
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.to_period('M')
        
        category_predictions = {}
        for category in df['category'].unique():
            category_data = df[df['category'] == category]
            monthly_category = category_data.groupby('month')['amount'].sum()
            
            if len(monthly_category) >= 2:
                X_cat = np.arange(len(monthly_category)).reshape(-1, 1)
                y_cat = monthly_category.values
                model_cat = LinearRegression()
                model_cat.fit(X_cat, y_cat)
                pred = model_cat.predict(np.array([[len(monthly_category)]]))
                category_predictions[category] = max(0, int(pred[0]))
            else:
                category_predictions[category] = int(monthly_category.sum())
        
        return {
            'predicted_expense': max(0, int(predicted_expense)),
            'confidence': round(confidence, 2),
            'trend': trend,
            'category_predictions': category_predictions
        }
    
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return {
            'predicted_expense': 0,
            'confidence': 0,
            'trend': 'Error',
            'category_predictions': {}
        }

# For testing
if __name__ == '__main__':
    test_transactions = [
        {'amount': 100, 'category': 'Food', 'date': '2024-01-01'},
        {'amount': 200, 'category': 'Travel', 'date': '2024-01-05'},
        {'amount': 150, 'category': 'Food', 'date': '2024-02-01'},
        {'amount': 250, 'category': 'Travel', 'date': '2024-02-05'},
    ]
    result = predict_next_month(test_transactions)
    print(result)
