from gemini_client import GeminiClient
import json

client = GeminiClient()

# Read the T&C text you want to test with
with open("prompt.txt", "r", encoding="utf-8") as f:
    content = f.read()

start = content.find('"""') + 3
end = content.rfind('"""')
tos_text = content[start:end].strip()

print(f"Read {len(tos_text)} characters")
print("Sending to Gemini...")

result = client.update_prompt(tos_text)
print(json.dumps(result, indent=2))