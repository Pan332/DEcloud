from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

app = Flask(__name__)
CORS(app)

@app.route('/api/sentiment', methods=['POST'])
def sentiment():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400

    text = data['text']
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    # Adjusted sentiment thresholds for TextBlob
    if polarity > 0.25:
        sentiment = 'positive'
    elif polarity < 0:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'

    return jsonify({
        'polarity': polarity,
        'sentiment': sentiment
    }), 200

if __name__ == '__main__':
    app.run(port=5001)
