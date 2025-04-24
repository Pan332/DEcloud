from flask import Flask, request, jsonify
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

nltk.download('vader_lexicon')
analyzer = SentimentIntensityAnalyzer()

@app.route('/api/sentiment', methods=['POST'])
def sentiment():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400

    text = data['text']
    scores = analyzer.polarity_scores(text)
    sentiment = 'neutral'
    if scores['compound'] >= 0.05:
        sentiment = 'positive'
    elif scores['compound'] <= -0.05:
        sentiment = 'negative'

    return jsonify({
        'scores': scores,
        'sentiment': sentiment
    }), 200


if __name__ == '__main__':
    app.run(port=5001)
