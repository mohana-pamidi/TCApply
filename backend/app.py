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
import logging

load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(message)s")
logger = logging.getLogger("tcapply-backend")

logger.info("Booting backend app...")
logger.info("API_KEY present: %s", bool(os.getenv("API_KEY")))

my_client = None


def get_client():
    global my_client
    if my_client is None:
        logger.info("Initializing GeminiClient...")
        my_client = GeminiClient()
        logger.info("GeminiClient initialized successfully")
    return my_client


@app.before_request
def log_request_start():
    logger.info("Incoming %s %s", request.method, request.path)

@app.route("/analyze", methods=["POST"])
def analyze():
    logger.info("Entered /analyze")
    data = request.get_json()

    if not data or "text" not in data:
        logger.warning("/analyze bad request: missing text")
        return jsonify({"error": "No text provided"}), 400

    tos_text = data["text"]
    logger.info("T&C text length: %s", len(tos_text))

    if len(tos_text) < 100:
        logger.warning("/analyze rejected: text too short")
        return jsonify({"error": "Text too short to be Terms & Conditions"}), 400

    # Pull optional fields from the request, with defaults if not provided
    service_type = data.get("service_type", "Detect automatically from text")
    jurisdiction = data.get("jurisdiction", "United States")
    user_concerns = data.get("user_concerns", "None provided")
    logger.info("Request metadata | service_type=%s jurisdiction=%s user_concerns=%s", service_type, jurisdiction, user_concerns)

    try:
        logger.info("Calling Gemini update_prompt...")
        client = get_client()
        result = client.update_prompt(tos_text, service_type, jurisdiction, user_concerns)
        logger.info("Gemini response parsed successfully")
        return jsonify(result)
    except Exception as e:
        logger.exception("Crash in /analyze")
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    logger.info("Health check OK")
    return jsonify({"status": "running"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)
