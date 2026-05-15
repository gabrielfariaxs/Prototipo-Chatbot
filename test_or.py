import os
import requests
import json
import base64

api_key = os.environ.get('OPENROUTER_API_KEY')
if not api_key:
    # Try reading from .env
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('OPENROUTER_API_KEY='):
                    api_key = line.split('=', 1)[1].strip()
    except Exception:
        pass

if not api_key:
    print("No API key")
    exit()

# Create a minimal 1-page PDF (base64)
# This is a valid tiny PDF
pdf_b64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1DBSKuey4uLgALxkGxwplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjI5CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERi9UZXh0L0ltYWdlQi9JbWFnZUMvSW1hZ2VJXT4+L0NvbnRlbnRzIDIgMCBSL1BhcmVudCA0IDAgUj4+CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sxIDAgUl0+PgplbmRvYmoKCjUgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDQgMCBSPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1Byb2R1Y2VyKEdob3N0c2NyaXB0IDkuNTMpL0NyZWF0aW9uRGF0ZShEOjIwMjExMTE1MTIwMDAwWik+PgplbmRvYmoKCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDEwNSAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwODUgMDAwMDAgbiAKMDAwMDAwMDIxNCAwMDAwMCBuIAowMDAwMDAwMjcyIDAwMDAwIG4gCjAwMDAwMDAzMTcgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDcvUm9vdCA1IDAgUi9JbmZvIDYgMCBSPj4Kc3RhcnR4cmVmCjQxMgolJUVPRgo="

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "~anthropic/claude-haiku-latest",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Hi, are you Claude Haiku?"}
            ]
        }
    ],
    "max_tokens": 1000
}

resp = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
print("Status:", resp.status_code)
print(resp.text)
