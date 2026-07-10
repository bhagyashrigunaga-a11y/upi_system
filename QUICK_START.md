# QUICK START GUIDE

## Prerequisites
- Node.js v14+ and npm
- Python 3.8+ and pip
- MongoDB (local or Atlas)
- Git

## 5-Minute Quick Start

### Step 1: Install MongoDB (if not installed)
**Windows:**
```bash
# Download and run MongoDB installer
# https://www.mongodb.com/try/download/community
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 2: Backend Setup (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
✅ Backend runs on http://localhost:5001

### Step 3: Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
npm start
```
✅ Frontend runs on http://localhost:3000

### Step 4: AI Model Setup (Terminal 3)
```bash
cd ai-model

# Windows:
python -m venv venv
venv\Scripts\activate

# macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Install and run:
pip install -r requirements.txt
python app.py
```
✅ AI Service runs on http://localhost:5000

## Now You Can:
1. Open http://localhost:3000 in browser
2. Register a new account
3. Add sample transactions
4. View dashboard with predictions
5. Check fraud detection
6. See AI-generated insights

## Sample Test Data

Add these transactions to test:

**January:**
- Swiggy: ₹500 (Food)
- Uber: ₹300 (Travel)
- Amazon: ₹2000 (Shopping)
- BESCOM: ₹1200 (Bills)

**February:**
- Swiggy: ₹600 (Food)
- Uber: ₹350 (Travel)
- Amazon: ₹2500 (Shopping)
- BESCOM: ₹1200 (Bills)

**March (with fraudulent transaction):**
- Swiggy: ₹50000 (Food) ← Fraudulent (should be detected)
- Uber: ₹400 (Travel)
- Amazon: ₹3000 (Shopping)

## Key Features to Test

### 1. Authentication
- Register with email
- Login with credentials
- Logout

### 2. Dashboard
- View total spending
- See category-wise breakdown
- Check recent transactions
- View fraud alerts

### 3. Transactions
- Add new transactions (auto-categorized)
- Filter by category
- Delete transactions
- Pagination

### 4. Insights
- View spending patterns
- Get budget recommendations
- See actionable insights
- Money-saving tips

### 5. Fraud Detection
- Unusual transaction detection
- Risk score calculation
- Alert severity levels
- Resolution tracking

## Useful Commands

### Backend
```bash
# Start with hot reload
npm run dev

# Start production
npm start
```

### Frontend
```bash
# Start development server
npm start

# Build for production
npm run build

# Test
npm test
```

### AI Model
```bash
# Run with debug
python -u app.py

# Run tests
python prediction.py
python fraud_detection.py
python categorization.py
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/upi-assistant
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
AI_SERVICE_URL=http://localhost:5000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001/api
```

## Troubleshooting Checklist

- [ ] MongoDB is running (`mongod` or service started)
- [ ] Backend is running on port 5001
- [ ] Frontend is running on port 3000
- [ ] AI service is running on port 5000
- [ ] All .env files are created
- [ ] Node modules installed (`npm install`)
- [ ] Python venv activated

## Common Issues

**"Cannot connect to MongoDB"**
```bash
# Check if MongoDB is running
# Windows: Services app -> MongoDB Server
# macOS: brew services list
# Linux: sudo systemctl status mongodb
```

**"Port already in use"**
```bash
# Kill process on port
# Windows: netstat -ano | findstr :5001
# macOS/Linux: lsof -i :5001 | kill -9 <PID>
```

**"ModuleNotFoundError: No module named 'sklearn'"**
```bash
cd ai-model
pip install -r requirements.txt
```

## Testing API Endpoints

### Using cURL or Postman

**Register:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

**Get Transactions:**
```bash
curl -X GET http://localhost:5001/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Add Transaction:**
```bash
curl -X POST http://localhost:5001/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Swiggy",
    "amount": 500,
    "paymentMethod": "UPI",
    "description": "Lunch"
  }'
```

## Next Steps

1. **Deploy Backend:** Heroku, Railway, or AWS
2. **Deploy Frontend:** Vercel, Netlify, or GitHub Pages
3. **Deploy AI:** Google Cloud Run or AWS Lambda
4. **Add Features:** Multi-user, reports, exports
5. **Scale:** Load testing, caching, optimization

## Getting Help

1. Check README.md for detailed documentation
2. Review error messages in browser console
3. Check terminal logs for backend/AI errors
4. Verify MongoDB connection
5. Ensure all three services are running

## File Structure Reference

```
.
├── backend/
│   ├── models/      (MongoDB schemas)
│   ├── controllers/ (Business logic)
│   ├── routes/      (API endpoints)
│   ├── middleware/  (Authentication)
│   ├── server.js    (Entry point)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
├── ai-model/
│   ├── prediction.py
│   ├── fraud_detection.py
│   ├── categorization.py
│   ├── app.py
│   └── requirements.txt
└── README.md
```

## Success Checklist

When everything is working:
✅ Backend responding at http://localhost:5001/api/health
✅ Frontend loading at http://localhost:3000
✅ Can register and login
✅ Can add transactions
✅ Dashboard shows data
✅ AI predictions working
✅ Fraud detection active
✅ Insights generating

Enjoy your AI-Powered UPI Payment Assistant! 🚀
