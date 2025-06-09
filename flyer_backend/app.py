from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from utils.flyer_utils import generate_flyer_image
from utils.report_utils import generate_report_text
from dotenv import load_dotenv
from huggingface_hub import snapshot_download
from pathlib import Path

mistral_models_path = Path.home().joinpath('mistral_models', '7B-Instruct-v0.3')
mistral_models_path.mkdir(parents=True, exist_ok=True)

snapshot_download(repo_id="mistralai/Mistral-7B-Instruct-v0.3", allow_patterns=["params.json", "consolidated.safetensors", "tokenizer.model.v3"], local_dir=mistral_models_path)
load_dotenv()

app = Flask(__name__)
CORS(app)

FLYER_DIR = os.path.join(os.path.dirname(__file__), 'generated', 'flyers')
os.makedirs(FLYER_DIR, exist_ok=True)

# --- Generate Only Flyer ---
@app.route('/generate', methods=['POST'])
def generate_flyer():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        image_path = generate_flyer_image(prompt)
        flyer_filename = os.path.basename(image_path)

        return jsonify({'flyer_url': f"/flyer/{flyer_filename}"})

    except Exception as e:
        print("Flyer generation error:", e)
        return jsonify({'error': str(e)}), 500

# --- Generate Only Report ---
@app.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        report_text = generate_report_text(prompt)
        return jsonify({'report': report_text})

    except Exception as e:
        print("Report generation error:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
