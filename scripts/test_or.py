import os
import requests
import json

api_key = os.environ.get('OPENROUTER_API_KEY')
if not api_key:
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('OPENROUTER_API_KEY='):
                    api_key = line.split('=', 1)[1].strip()
    except Exception:
        pass

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "openrouter/free",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Hi, who are you? Respond in 5 words."}
            ]
        }
    ],
    "max_tokens": 800
}

resp = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
print("Status:", resp.status_code)
print(resp.text)
