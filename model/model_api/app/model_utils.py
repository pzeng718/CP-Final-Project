import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load the Keras model and tokenizer
model = load_model('app/model/my_model.keras')

with open('app/model/tokenizer.pkl', 'rb') as file:
    tokenizer = pickle.load(file)

max_sequence_len = 42

# 定义 predict_next_words 和 predict_next_words2 函数
def predict_next_words(model, tokenizer, text, num_words=15):
    current_text = text
    for _ in range(num_words):
        sequence = tokenizer.texts_to_sequences([current_text])[0]
        padded_sequence = pad_sequences([sequence], maxlen=max_sequence_len-1, padding='pre')
        predictions = model.predict(padded_sequence)[0]
        next_word_index = np.argmax(predictions)
        next_word = tokenizer.index_word.get(next_word_index, '')
        current_text += ' ' + next_word
    return current_text

def predict_next_words2(model, tokenizer, text, num_words=3):
    output_words = []
    sequence = tokenizer.texts_to_sequences([text])[0]
    padded_sequence = pad_sequences([sequence], maxlen=max_sequence_len-1, padding='pre')
    predictions = model.predict(padded_sequence)[0]
    predicted_word_indices = np.argsort(predictions)[-num_words:]
    for idx in predicted_word_indices:
        output_words.append(tokenizer.index_word.get(idx, ''))
    return ' '.join(output_words)

predict_next_words(model, tokenizer, "buy", num_words=3)