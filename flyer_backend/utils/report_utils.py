import os
import requests
from dotenv import load_dotenv

load_dotenv()
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

headers = {
    "Authorization": f"Bearer {HUGGINGFACE_API_KEY}"
}

def generate_report_text(prompt: str) -> str:
    url = "https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"  # known working model
    payload = {
        "inputs": f"Write a short environmental awareness report on:\n{prompt}"
    }

    try:
        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            print("Report generation failed:", response.status_code, response.text)
            return "Report generation failed."

        try:
            result = response.json()
            print("Raw result:", result)

            if isinstance(result, list) and "generated_text" in result[0]:
                return result[0]["generated_text"]
            elif isinstance(result, dict) and "generated_text" in result:
                return result["generated_text"]
            else:
                print("Unexpected response format:", result)
                return "Unexpected response structure."

        except ValueError as json_err:
            print("Invalid JSON in report response:", response.text)
            return "Failed to parse report response."

    except Exception as e:
        print("Report generation error:", e)
        return "Report generation failed."
