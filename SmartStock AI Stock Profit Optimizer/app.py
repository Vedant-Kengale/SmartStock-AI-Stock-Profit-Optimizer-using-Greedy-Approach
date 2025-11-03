from flask import Flask, render_template, request, jsonify
import numpy as np
from sklearn.linear_model import LinearRegression
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

def maxProfit(prices):
    profit = 0
    transactions = []
    i = 0
    n = len(prices)
    while i < n-1:
        # find local minima
        while i < n-1 and prices[i+1] <= prices[i]:
            i += 1
        buy = i
        # find local maxima
        while i < n-1 and prices[i+1] > prices[i]:
            i += 1
        sell = i
        if buy < sell:
            transactions.append({'buy_day': int(buy), 'sell_day': int(sell),
                                 'buy_price': float(prices[buy]), 'sell_price': float(prices[sell])})
    for t in transactions:
        profit += t['sell_price'] - t['buy_price']
    return int(profit), transactions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    prices = np.array(data.get('prices', []), dtype=float)
    if prices.size == 0:
        return jsonify({'error': 'No prices provided'}), 400

    profit, transactions = maxProfit(prices)

    # Simple ML: Linear Regression on day index -> price
    X = np.arange(len(prices)).reshape(-1,1)
    y = prices
    model = LinearRegression()
    model.fit(X, y)
    next_day = float(model.predict([[len(prices)]])[0])

    return jsonify({'profit': profit, 'next_price': round(next_day,2), 'transactions': transactions})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
