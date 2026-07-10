# API DOCUMENTATION

## Base URL
```
http://localhost:5001/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "9876543210"  // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Login User
**POST** `/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "totalSpending": 15000
  }
}
```

---

## Transaction Endpoints

### 1. Create Transaction
**POST** `/transactions`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "merchant": "Swiggy",
  "amount": 450.50,
  "paymentMethod": "UPI",
  "description": "Lunch delivery"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "merchant": "Swiggy",
    "amount": 450.50,
    "category": "Food",
    "date": "2024-01-15T10:30:00Z",
    "paymentMethod": "UPI",
    "description": "Lunch delivery",
    "status": "Success",
    "riskScore": 0,
    "isFraudulent": false
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide merchant and amount"
}
```

---

### 2. Get Transactions
**GET** `/transactions?page=1&limit=10&category=Food&startDate=2024-01-01&endDate=2024-01-31`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `category` (optional): Food, Travel, Shopping, Bills, Entertainment, Healthcare, Education, Other
- `startDate` (optional): YYYY-MM-DD format
- `endDate` (optional): YYYY-MM-DD format

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "pages": 5,
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "merchant": "Swiggy",
      "amount": 450.50,
      "category": "Food",
      "date": "2024-01-15T10:30:00Z",
      "paymentMethod": "UPI",
      "status": "Success"
    }
    // ... more transactions
  ]
}
```

---

### 3. Get Transaction Stats
**GET** `/transactions/stats/monthly`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "monthlySpending": 15000,
    "categorySpending": {
      "Food": 3500,
      "Travel": 2000,
      "Shopping": 5000,
      "Bills": 4500
    },
    "recentTransactions": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "merchant": "Swiggy",
        "amount": 450,
        "category": "Food",
        "date": "2024-01-15T10:30:00Z"
      }
      // ... up to 5 recent transactions
    ],
    "averageTransaction": 750,
    "transactionCount": 20
  }
}
```

---

### 4. Update Transaction
**PUT** `/transactions/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "amount": 500,
  "merchant": "Zomato",
  "description": "Dinner"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439012",
    "amount": 500,
    "merchant": "Zomato",
    "category": "Food",
    "description": "Dinner"
    // ... other fields
  }
}
```

---

### 5. Delete Transaction
**DELETE** `/transactions/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

## AI/ML Endpoints

### 1. Predict Next Month's Expense
**GET** `/ai/predict`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "prediction": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "month": "2024-02",
    "predictedExpense": 15500,
    "actualExpense": null,
    "categoryPredictions": {
      "Food": 3800,
      "Travel": 2200,
      "Shopping": 5200,
      "Bills": 4300
    },
    "trend": "Increasing",
    "confidence": 0.87
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Not enough transaction history for prediction"
}
```

---

### 2. Detect Fraudulent Transactions
**POST** `/ai/detect-fraud`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "alertCount": 2,
  "alerts": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439011",
      "transactionId": "507f1f77bcf86cd799439012",
      "amount": 50000,
      "riskScore": 0.92,
      "alertMessage": "Unusual transaction of ₹50000 detected at Swiggy",
      "status": "Active",
      "severity": "Critical",
      "reason": "Unusually high amount",
      "detectedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Generate AI Insights
**GET** `/ai/insights`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "insights": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439011",
      "title": "High Food Spending",
      "description": "You spent 25% more on food this month.",
      "type": "Warning",
      "category": "Food",
      "value": 25,
      "priority": "High",
      "actionable": true,
      "isRead": false
    },
    {
      "title": "Saving Opportunity",
      "description": "You can save ₹500 by reducing shopping expenses by 10%.",
      "type": "Recommendation",
      "category": "Shopping",
      "value": 500,
      "priority": "High",
      "actionable": true
    }
  ]
}
```

---

### 4. Get Budget Recommendations
**GET** `/ai/budget-recommendations`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "recommendations": {
    "Food": {
      "avgMonthly": 3500,
      "recommendedBudget": 3850,
      "transactionCount": 45
    },
    "Travel": {
      "avgMonthly": 2000,
      "recommendedBudget": 2200,
      "transactionCount": 28
    },
    "Shopping": {
      "avgMonthly": 5000,
      "recommendedBudget": 5500,
      "transactionCount": 12
    },
    "Bills": {
      "avgMonthly": 4500,
      "recommendedBudget": 4950,
      "transactionCount": 4
    }
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (invalid token) |
| 404 | Not Found |
| 500 | Server Error |

---

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Rate Limiting (for future implementation)
- 100 requests per minute per user
- 1000 requests per hour per user

---

## Authentication Token Format

JWT tokens contain:
```json
{
  "id": "user_id",
  "iat": 1234567890,
  "exp": 1234654290  // expires in 7 days
}
```

Token is valid for **7 days**

---

## WebSocket Events (future feature)
```javascript
// Real-time transaction updates
socket.on('transaction:created', (transaction) => {...})
socket.on('fraud:detected', (alert) => {...})
```

---

## Rate Limiting Headers (future)
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

---

## Example Complete Flow

### 1. Register
```bash
POST /auth/register
→ Get JWT token
```

### 2. Add Transactions
```bash
POST /transactions (with token)
POST /transactions (with token)
POST /transactions (with token)
```

### 3. Get Stats
```bash
GET /transactions/stats/monthly (with token)
```

### 4. Generate Predictions
```bash
GET /ai/predict (with token)
```

### 5. Detect Fraud
```bash
POST /ai/detect-fraud (with token)
```

### 6. Get Insights
```bash
GET /ai/insights (with token)
```

### 7. Get Recommendations
```bash
GET /ai/budget-recommendations (with token)
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","phone":"9876543210"}'
```

### Add Transaction
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:5001/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"merchant":"Swiggy","amount":500,"paymentMethod":"UPI"}'
```

### Get Transactions
```bash
TOKEN="your_token_here"
curl -X GET "http://localhost:5001/api/transactions?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Pagination Example

Request:
```
GET /transactions?page=2&limit=20
```

Response:
```json
{
  "count": 20,
  "total": 150,
  "pages": 8,
  "currentPage": 2
}
```

To get page 3:
```
GET /transactions?page=3&limit=20
```

---

## Sorting & Filtering (recommended features)

Future enhancements:
```
GET /transactions?sort=date&order=desc
GET /transactions?search=merchant_name
GET /transactions?minAmount=100&maxAmount=5000
```

---

**Last Updated:** January 2024
**Version:** 1.0.0
