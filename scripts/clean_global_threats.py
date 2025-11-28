# clean_global_threats.py
import pandas as pd
import os

input_path = "../data/Global_Cybersecurity_Threats_2015-2024.csv"
output_path = "../data/global_threats_clean.csv"

if not os.path.exists(input_path):
    raise SystemExit(f"❌ File not found: {input_path}")

df = pd.read_csv(input_path, encoding="utf-8", on_bad_lines="skip", low_memory=False)
print(f"✅ Loaded Global Threats dataset -> {df.shape}")

# Find any text/description column
text_col = None
for col in df.columns:
    if any(k in col.lower() for k in ['text', 'desc', 'summary', 'vulnerability', 'type']):
        text_col = col
        break

if not text_col:
    text_col = df.columns[0]

df = df[[text_col]].dropna()
df.rename(columns={text_col: "text"}, inplace=True)
df["text"] = df["text"].astype(str).str.replace(r'\s+', ' ', regex=True).str.strip()

df.to_csv(output_path, index=False)
print(f"✅ Cleaned Global Threats dataset saved -> {output_path} ({df.shape})")
