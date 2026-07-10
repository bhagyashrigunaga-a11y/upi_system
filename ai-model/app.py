"""
Flask API Server for AI Models
Provides endpoints for prediction, fraud detection, and categorization
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from prediction import predict_next_month
from fraud_detection import detect_anomalies, get_risk_level
from categorization import categorize_transaction, batch_categorize

app = Flask(__name__)
CORS(app)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'AI Model Server'
    })

# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict next month's expenses
    Expected JSON: { "transactions": [...] }
    """
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        
        if not transactions:
            return jsonify({
                'error': 'No transactions provided'
            }), 400
        
        prediction_result = predict_next_month(transactions)
        
        return jsonify(prediction_result), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

# Fraud detection endpoint
@app.route('/detect-fraud', methods=['POST'])
def detect_fraud():
    """
    Detect fraudulent transactions
    Expected JSON: { "transactions": [...] }
    """
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        
        if not transactions:
            return jsonify({
                'error': 'No transactions provided'
            }), 400
        
        fraud_result = detect_anomalies(transactions)
        
        # Add risk level to each fraud transaction
        for fraud_tx in fraud_result['fraud_transactions']:
            fraud_tx['risk_level'] = get_risk_level(fraud_tx['risk_score'])
        
        return jsonify(fraud_result), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

# Categorization endpoint
@app.route('/categorize', methods=['POST'])
def categorize():
    """
    Categorize transactions
    Expected JSON: { "transactions": [...] } or { "merchant": "..." }
    """
    try:
        data = request.get_json()
        
        # Single merchant
        if 'merchant' in data:
            category = categorize_transaction(data['merchant'])
            return jsonify({
                'merchant': data['merchant'],
                'category': category
            }), 200
        
        # Multiple transactions
        if 'transactions' in data:
            transactions = data['transactions']
            categorized = batch_categorize(transactions)
            return jsonify({
                'transactions': categorized
            }), 200
        
        return jsonify({
            'error': 'Invalid request format'
        }), 400
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

# Batch prediction and analysis endpoint
@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Complete analysis including prediction, fraud detection, and categorization
    """
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        
        if not transactions:
            return jsonify({
                'error': 'No transactions provided'
            }), 400
        
        # Categorize transactions
        categorized_txs = batch_categorize(transactions)
        
        # Predict future expenses
        prediction = predict_next_month(categorized_txs)
        
        # Detect fraud
        fraud_detection = detect_anomalies(categorized_txs)
        
        return jsonify({
            'transactions': categorized_txs,
            'prediction': prediction,
            'fraud_detection': fraud_detection
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting AI Model Server on http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')
