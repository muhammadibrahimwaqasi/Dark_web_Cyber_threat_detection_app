import pandas as pd
import os

input_path = r"../data/clydeiii_cybersecurity_clean.csv"
output_path = r"../data/clydeiii_final_clean.csv"

if not os.path.exists(input_path):
    raise SystemExit(f"❌ File not found: {input_path}")

# Try multiple encodings
for enc in ('utf-8', 'latin1', 'ISO-8859-1'):
    try:
        df = pd.read_csv(input_path, encoding=enc, on_bad_lines='skip', low_memory=False)
        print(f"✅ Loaded Clydeiii dataset ({enc}) -> {df.shape}")
        break
    except Exception as e:
        print(f"⚠️ Could not read with {enc}: {e}")
else:
    raise SystemExit("❌ Could not read Clydeiii dataset at all.")

# Detect potential text column
text_col = None
for col in df.columns:
    if any(k in col.lower() for k in ['text', 'desc', 'content', 'message', 'data']):
        text_col = col
        break

if text_col:
    print(f"📝 Detected text column: {text_col}")
    df = df[[text_col]]
    df = df.dropna().rename(columns={text_col: "text"})
else:
    # If no clear text column, assume all rows are text in a single unnamed column
    df = df.iloc[:, 0].dropna().to_frame(name="text")
    print("ℹ️ No clear text column found, using first column as text.")

# Clean text (remove non-printable chars)
df["text"] = df["text"].astype(str).str.replace(r"[\r\n\t]+", " ", regex=True).str.strip()

# Save cleaned version
df.to_csv(output_path, index=False)
print(f"✅ Cleaned Clydeiii dataset saved -> {output_path} ({df.shape})")
