"""
Transaction Categorization using Rule-Based System
Automatically categorizes transactions based on merchant name
"""

# Merchant keywords mapped to categories
CATEGORY_KEYWORDS = {
    'Food': [
        'swiggy', 'zomato', 'food', 'restaurant', 'cafe', 'coffee',
        'pizza', 'burger', 'mcd', 'mcdonalds', 'kfc', 'dominos',
        'bakery', 'juice', 'tea', 'dhabha', 'dhaba', 'bistro',
        'kitchen', 'bakes', 'cake', 'pastry', 'snacks', 'eatery'
    ],
    'Travel': [
        'uber', 'ola', 'metro', 'railway', 'train', 'bus',
        'taxi', 'auto', 'flight', 'airline', 'booking', 'redbus',
        'goibibo', 'transport', 'travel', 'airbnb', 'hotel', 'resort',
        'motel', 'lodge', 'inn', 'parking', 'petrol', 'gas', 'fuel'
    ],
    'Shopping': [
        'amazon', 'flipkart', 'mall', 'store', 'shop', 'retail',
        'myntra', 'ajio', 'bigbasket', 'bania', 'bazaar', 'market',
        'outlet', 'target', 'supermarket', 'grocery', 'departmental',
        'clothes', 'fashion', 'apparel', 'shoes', 'wear', 'apparels'
    ],
    'Bills': [
        'bescom', 'electricity', 'water', 'telephone', 'mobile',
        'internet', 'gas', 'bill', 'utility', 'jio', 'airtel',
        'vodafone', 'bsnl', 'power', 'supply', 'broadband'
    ],
    'Entertainment': [
        'movie', 'cinema', 'theater', 'theatre', 'gaming', 'music',
        'spotify', 'netflix', 'prime', 'hotstar', 'zee', 'sony',
        'entertainment', 'games', 'playstation', 'xbox', 'play', 'show'
    ],
    'Healthcare': [
        'hospital', 'doctor', 'clinic', 'pharmacy', 'medical',
        'health', 'dentist', 'laboratory', 'lab', 'diagnostic',
        'medicine', 'drug', 'chemist', 'doctor', 'surgery', 'healthcare'
    ],
    'Education': [
        'school', 'college', 'university', 'institute', 'course',
        'class', 'tuition', 'coaching', 'academy', 'education',
        'training', 'exam', 'study', 'skill', 'learn', 'university'
    ],
}

def categorize_transaction(merchant_name, amount=None):
    """
    Categorize a transaction based on merchant name
    
    Args:
        merchant_name: Name of the merchant
        amount: Transaction amount (optional, for additional context)
    
    Returns:
        Category string
    """
    if not merchant_name:
        return 'Other'
    
    merchant_lower = merchant_name.lower().strip()
    
    # Check each category's keywords
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in merchant_lower:
                return category
    
    # Default category
    return 'Other'

def batch_categorize(transactions):
    """
    Categorize multiple transactions
    
    Args:
        transactions: List of transaction dictionaries
    
    Returns:
        List of transactions with categorized field
    """
    categorized = []
    for tx in transactions:
        tx['category'] = categorize_transaction(tx.get('merchant', ''))
        categorized.append(tx)
    
    return categorized

# For testing
if __name__ == '__main__':
    test_merchants = [
        'Swiggy',
        'Uber',
        'Amazon',
        'BESCOM',
        'Netflix',
        'Clinic Pro',
        'IIT Delhi',
        'Random Store'
    ]
    
    for merchant in test_merchants:
        category = categorize_transaction(merchant)
        print(f"{merchant} -> {category}")
