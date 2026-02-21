# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from dotenv import load_dotenv
# from gemini_client import GeminiClient
# import os


# load_dotenv()  # Loads your .env file

# my_client = gemini_client.GeminiClient()


# app = Flask(__name__)
# CORS(app)  # Allows the Chrome extension to make requests

# @app.route("/analyze", methods=["POST"])
# def analyze():
#     data = request.get_json()

#     # if not data or "text" not in data:
#     #     return jsonify({"error": "No text provided"}), 400

#     # # tos_text = data["text"]

#     # if len(tos_text) < 100:
#     #     return jsonify({"error": "Text too short to be Terms & Conditions"}), 400

#     try:
#         result = my_client.update_prompt()
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "running"})

# if __name__ == "__main__":
    
#     app.run(debug=True, port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from gemini_client import GeminiClient
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

my_client = GeminiClient()

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    tos_text = data["text"]

    if len(tos_text) < 100:
        return jsonify({"error": "Text too short to be Terms & Conditions"}), 400

    # Pull optional fields from the request, with defaults if not provided
    service_type = data.get("service_type", "Detect automatically from text")
    jurisdiction = data.get("jurisdiction", "United States")
    user_concerns = data.get("user_concerns", "None provided")

    try:
        result = my_client.update_prompt(tos_text, service_type, jurisdiction, user_concerns)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)