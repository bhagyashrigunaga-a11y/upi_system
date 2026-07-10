# AI-Powered Smart UPI Payment Assistant

A comprehensive full-stack web application that uses AI/ML to analyze spending habits, detect fraudulent transactions, predict future expenses, and provide intelligent financial insights.

## Project Overview

This application simulates UPI transactions and leverages machine learning algorithms to:
- **Predict** future expenses using Linear Regression
- **Detect** fraudulent transactions using Isolation Forest
- **Categorize** transactions automatically
- **Generate** personalized AI insights
- **Recommend** budget allocations

## Tech Stack

### Frontend
- **React.js** - Modern UI framework with Hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **CSS3** - Responsive design

### Backend
- **Node.js + Express.js** - REST API server
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

### AI/ML
- **Python** - Core ML language
- **Pandas & NumPy** - Data manipulation
- **Scikit-learn** - ML algorithms
- **Flask** - ML service API

## Features

### 1. User Authentication
- User registration with email validation
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Protected routes

### 2. Dashboard
Real-time financial overview with:
- Total and monthly spending
- Category-wise spending breakdown
- Recent transactions list
- Fraud alerts summary
- Quick action buttons

### 3. Transaction Management
- Add new transactions with auto-categorization
- Edit and delete transactions
- Filter by category and date range
- Pagination support
- Transaction history

### 4. Smart Categorization
Automatic categorization of merchants:
- **Food**: Swiggy, Zomato, Restaurants
- **Travel**: Uber, Metro, Airlines
- **Shopping**: Amazon, Flipkart, Malls
- **Bills**: BESCOM, Electricity, Internet
- **Entertainment**: Netflix, Gaming
- **Healthcare**: Hospitals, Pharmacies
- **Education**: Schools, Courses
- **Other**: Uncategorized

### 5. Expense Prediction
Linear Regression model that:
- Analyzes 12 months of historical data
- Predicts next month's total spending
- Provides category-wise predictions
- Shows spending trends (Increasing/Decreasing/Stable)
- Calculates confidence scores

### 6. Fraud Detection
Isolation Forest algorithm for:
- Detecting unusual transaction patterns
- Calculating risk scores (0-1)
- Classifying severity (Low/Medium/High/Critical)
- Alert generation and tracking
- False alarm marking

### 7. AI Insights
Generates actionable insights:
- Spending changes per category
- Saving opportunities
- Budget recommendations
- Priority-based alerts

### 8. Budget Recommendations
Suggests monthly budgets for:
- Each spending category
- Based on average spending + 10% buffer
- Transaction count per category

## Project Structure

```
ai-upi-payment-assistant/
│
├── frontend/                          # React.js application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js
│   │   │   ├── StatCard.js
│   │   │   ├── TransactionForm.js
│   │   │   ├── TransactionList.js
│   │   │   ├── InsightCard.js
│   │   │   ├── FraudAlert.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Transactions.js
│   │   │   ├── Insights.js
│   │   │   └── FraudDetection.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env
│
├── backend/                           # Node.js + Express API
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Prediction.js
│   │   ├── FraudAlert.js
│   │   └── Insight.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── aiController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── aiRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── ai-model/                          # Python ML Services
│   ├── prediction.py
│   ├── fraud_detection.py
│   ├── categorization.py
│   ├── app.py
│   └── requirements.txt
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MongoDB (Local or Atlas)
- npm or yarn

### Step 1: Clone and Setup Directories

```bash
cd ai-upi-payment-assistant
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with:
MONGODB_URI=mongodb://localhost:27017/upi-assistant
JWT_SECRET=your_secure_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
AI_SERVICE_URL=http://localhost:5000

# Start backend server
npm run dev
# Backend runs on http://localhost:5001
```

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with:
REACT_APP_API_URL=http://localhost:5001/api

# Start frontend development server
npm start
# Frontend runs on http://localhost:3000
```

### Step 4: AI Model Setup

```bash
cd ai-model

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start AI model server
python app.py
# AI service runs on http://localhost:5000
```

### Step 5: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod

# MongoDB runs on mongodb://localhost:27017
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update MONGODB_URI in backend/.env

## Running the Application

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend Development Server
```bash
cd frontend
npm start
```

### Terminal 3: AI Model Server
```bash
cd ai-model
python app.py
```

Visit http://localhost:3000 in your browser

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "9876543210"
}

Response: { "success": true, "token": "jwt_token", "user": {...} }
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response: { "success": true, "token": "jwt_token", "user": {...} }
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response: { "success": true, "user": {...} }
```

### Transaction Endpoints

#### Create Transaction
```
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "merchant": "Swiggy",
  "amount": 500,
  "paymentMethod": "UPI",
  "description": "Food delivery"
}

Response: { "success": true, "transaction": {...} }
```

#### Get Transactions
```
GET /api/transactions?page=1&limit=10&category=Food
Authorization: Bearer {token}

Response: { "success": true, "transactions": [...], "total": 100, "pages": 10 }
```

#### Get Monthly Stats
```
GET /api/transactions/stats/monthly
Authorization: Bearer {token}

Response: { 
  "success": true, 
  "stats": { 
    "monthlySpending": 5000,
    "categorySpending": {...},
    "recentTransactions": [...],
    "averageTransaction": 250,
    "transactionCount": 20
  } 
}
```

#### Update Transaction
```
PUT /api/transactions/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 600,
  "merchant": "New Merchant"
}

Response: { "success": true, "transaction": {...} }
```

#### Delete Transaction
```
DELETE /api/transactions/{id}
Authorization: Bearer {token}

Response: { "success": true }
```

### AI Endpoints

#### Predict Expense
```
GET /api/ai/predict
Authorization: Bearer {token}

Response: { 
  "success": true, 
  "prediction": { 
    "predictedExpense": 5500,
    "categoryPredictions": {...},
    "trend": "Increasing",
    "confidence": 0.85
  } 
}
```

#### Detect Fraud
```
POST /api/ai/detect-fraud
Authorization: Bearer {token}

Response: { 
  "success": true, 
  "alertCount": 2,
  "alerts": [...]
}
```

#### Generate Insights
```
GET /api/ai/insights
Authorization: Bearer {token}

Response: { 
  "success": true, 
  "insights": [
    {
      "title": "High Food Spending",
      "description": "You spent 25% more on food this month",
      "type": "Warning",
      "priority": "High",
      "value": 25
    }
  ] 
}
```

#### Get Budget Recommendations
```
GET /api/ai/budget-recommendations
Authorization: Bearer {token}

Response: { 
  "success": true, 
  "recommendations": {
    "Food": {
      "avgMonthly": 1500,
      "recommendedBudget": 1650,
      "transactionCount": 45
    },
    ...
  } 
}
```

## Testing the Application

### Sample Transaction Data
```json
[
  {
    "merchant": "Swiggy",
    "amount": 450,
    "category": "Food",
    "date": "2024-01-15"
  },
  {
    "merchant": "Uber",
    "amount": 200,
    "category": "Travel",
    "date": "2024-01-16"
  },
  {
    "merchant": "Amazon",
    "amount": 2500,
    "category": "Shopping",
    "date": "2024-01-17"
  },
  {
    "merchant": "BESCOM",
    "amount": 1200,
    "category": "Bills",
    "date": "2024-01-18"
  }
]
```

### Test Predictions
1. Add transactions for multiple months
2. Go to Dashboard or Insights
3. Click "View Insights" to see predictions

### Test Fraud Detection
1. Add an unusually high transaction (e.g., ₹50000 for food)
2. Go to Fraud Detection page
3. Check for anomaly alerts

## Database Schemas

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  totalSpending: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  merchant: String,
  amount: Number,
  category: String,
  date: Date,
  paymentMethod: String,
  description: String,
  status: String,
  riskScore: Number,
  isFraudulent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Prediction Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  month: String (YYYY-MM),
  predictedExpense: Number,
  actualExpense: Number,
  categoryPredictions: Object,
  trend: String,
  confidence: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### FraudAlert Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  transactionId: ObjectId (ref: Transaction),
  amount: Number,
  riskScore: Number,
  alertMessage: String,
  status: String,
  severity: String,
  reason: String,
  detectedAt: Date,
  resolvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features Explained

### Expense Prediction (Linear Regression)
- Uses last 12 months of transactions
- Fits a linear regression model
- Predicts next month's spending
- Calculates trend (Increasing/Decreasing/Stable)
- Provides confidence scores

### Fraud Detection (Isolation Forest)
- Analyzes transaction amounts and patterns
- Detects statistical anomalies
- Assigns risk scores 0-1
- Identifies reasons for flagging
- Supports user review and resolution

### Smart Categorization
- Rule-based merchant matching
- 8 predefined categories
- Fallback to "Other" for unknown merchants
- Real-time categorization

### AI Insights
- Compares current month vs last month
- Identifies spending increases (>20%)
- Finds saving opportunities (>20% decrease)
- Recommends 10% reduction potential
- Prioritizes actionable insights

## Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running
Windows: mongod
macOS/Linux: brew services start mongodb-community
```

### Port Already in Use
```
If port 5001 (backend) is in use:
netstat -ano | findstr :5001
taskkill /PID <PID> /F

If port 3000 (frontend) is in use:
Set PORT=3001 && npm start
```

### JWT Token Invalid
```
Solution: Clear browser localStorage and login again
localStorage.clear()
```

### AI Service Not Responding
```
Ensure Flask app is running:
cd ai-model
python app.py
Check if running on http://localhost:5000
```

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build folder
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Add Procfile: web: node server.js
git push heroku main
```

### AI Service (Google Cloud/AWS)
- Containerize with Docker
- Deploy to Cloud Run/Lambda
- Update AI_SERVICE_URL in backend

## Security Best Practices

1. **JWT Secret**: Use strong, random secrets
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Use MongoDB Atlas with IP whitelist
4. **Passwords**: Enforce strong password policies
5. **Rate Limiting**: Implement API rate limiting
6. **Input Validation**: Validate all user inputs
7. **CORS**: Configure CORS properly for domains

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Multi-currency support
- [ ] Recurring transactions
- [ ] Bill reminders
- [ ] Export reports (PDF/Excel)
- [ ] Advanced analytics
- [ ] Machine learning model improvements
- [ ] Social features (expense splitting)
- [ ] Integration with real UPI providers

## License

MIT License - Feel free to use this project

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in console
3. Check MongoDB connection
4. Verify all services are running

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Made with ❤️ for Financial Wellness**
#   a i - u p i - p a y m e n t - a s s i s t a n t  
 