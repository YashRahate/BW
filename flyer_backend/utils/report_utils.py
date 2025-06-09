from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

model_name = "mistralai/Mistral-7B-Instruct-v0.3"

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",  # Uses GPU if available
    torch_dtype=torch.float16  # Optional: reduces memory usage
)

# Create generation pipeline
report_pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    device=0 if torch.cuda.is_available() else -1
)

def generate_report_text(prompt: str) -> str:
    formatted_prompt = f"[INST] Write a short environmental awareness report on:\n{prompt} [/INST]"
    try:
        result = report_pipe(
            formatted_prompt,
            max_new_tokens=300,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        return result[0]['generated_text'].replace(formatted_prompt, "").strip()
    except Exception as e:
        print("Error generating report:", e)
        return "Report generation failed."
