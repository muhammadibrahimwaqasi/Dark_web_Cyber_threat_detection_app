import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_threat(text):
    """Uses GPT to classify and explain text."""
    prompt = f"""
    Analyze the following text for cybersecurity risk. 
    Classify it as 'threat' or 'non-threat' and explain why:

    TEXT: {text}
    """
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    return resp.choices[0].message.content.strip()
