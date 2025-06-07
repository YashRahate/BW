# backend/utils/flyer_utils.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("HUGGINGFACE_API_KEY")

headers = {"Authorization": f"Bearer {API_KEY}"}

def generate_flyer_image(prompt: str) -> str:
    url = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
    payload = {"inputs": prompt}

    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code != 200:
            print("Flyer generation failed:", response.text)
            return "https://via.placeholder.com/1024x1024.png?text=Image+Failed"

        flyer_dir = os.path.join(os.path.dirname(__file__), '..', 'generated', 'flyers')
        os.makedirs(flyer_dir, exist_ok=True)
        image_path = os.path.join(flyer_dir, "flyer.png")

        with open(image_path, "wb") as f:
            f.write(response.content)

        return image_path
    except Exception as e:
        print("Image generation error:", e)
        return "https://via.placeholder.com/1024x1024.png?text=Error"
