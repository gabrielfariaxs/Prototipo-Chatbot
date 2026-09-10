import requests
import json
import os

api_key = os.environ.get("ANTHROPIC_API_KEY", "COLOQUE_SUA_CHAVE_AQUI")
headers = {
    "x-api-key": api_key,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
}

data = {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 100,
    "messages": [
        {"role": "user", "content": "Olá, confirme se você é a API oficial do Claude"}
    ],
    "temperature": 0.3
}

try:
    print("Enviando requisição para a API do Anthropic Claude...")
    resp = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
    print("Status:", resp.status_code)
    print("Resposta:")
    print(resp.text)
except Exception as e:
    print("Erro:", e)
