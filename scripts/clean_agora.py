# clean_agora.py
import pandas as pd
import os

input_path = "../data/Agora.csv"
output_path = "../data/agora_clean.csv"

if not os.path.exists(input_path):
    raise SystemExit(f"❌ File not found: {input_path}")

for enc in ('utf-8', 'latin1', 'ISO-8859-1'):
    try:
        df = pd.read_csv(input_path, encoding=enc, on_bad_lines="skip", low_memory=False)
        print(f"✅ Loaded Agora dataset with encoding {enc} -> {df.shape}")
        break
    except Exception as e:
        print(f"⚠️ Could not read with {enc}: {e}")

print(f"✅ Loaded Agora dataset -> {df.shape}")

# Try to find a text column
text_col = None
for col in df.columns:
    if any(k in col.lower() for k in ['text', 'desc', 'content', 'title', 'post']):
        text_col = col
        break

if not text_col:
    text_col = df.columns[0]  # fallback

df = df[[text_col]].dropna()
df.rename(columns={text_col: "text"}, inplace=True)

# Clean text
df["text"] = df["text"].astype(str).str.replace(r'\s+', ' ', regex=True).str.strip()

df.to_csv(output_path, index=False)
print(f"✅ Cleaned Agora dataset saved -> {output_path} ({df.shape})")
