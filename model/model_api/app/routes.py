from flask import request, jsonify
from .model_utils import predict_next_words, predict_next_words2,model,tokenizer

def init_routes(app):
    @app.route('/predict', methods=['POST'])
    def predict():
        data = request.get_json(force=True)
        input_text = data['text']
        num_words = data.get('num_words', 15)  
        try:
            result = predict_next_words(model, tokenizer, input_text, num_words)
            return jsonify({'result': result})
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/predict2', methods=['POST'])
    def predict2():
        data = request.get_json(force=True)
        input_text = data['text']
        num_words = data.get('num_words', 5)
        try:
            result = predict_next_words2(model, tokenizer, input_text, num_words)
            return jsonify({'result': result})
        except Exception as e:
            return jsonify({'error': str(e)}), 400