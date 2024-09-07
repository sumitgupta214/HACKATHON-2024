import numpy as np
import pickle
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the ML model from the .pkl file
with open('E:\\HACKATHON 2024\\python script\\xgboost_model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate input
        if not isinstance(data, dict) or len(data) != 10:
            raise ValueError("Input must be a JSON object with exactly 10 features.")
        
        # Convert input data to numeric values
        numeric_data = []
        for key, value in data.items():
            try:
                numeric_value = float(value)  # Convert to float
                numeric_data.append(numeric_value)
            except ValueError:
                raise ValueError(f"Value for {key} could not be converted to a numeric type.")

        # Ensure data is in the correct shape for the model
        data_array = np.array([numeric_data])
        if data_array.shape[1] != 10:
            raise ValueError(f"Expected 10 features, but got {data_array.shape[1]}.")
        
        # Predict using the model
        prediction = model.predict_proba(data_array)
        
        # Extract probability for the positive class
        human_prob = prediction[0][1]
        
        return jsonify({'prediction': human_prob.tolist()})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Run on port 5001
