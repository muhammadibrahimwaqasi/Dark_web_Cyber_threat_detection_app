import os
import pandas as pd

# Folder where you placed the .txt files
data_folder = r"C:\Users\Administrator\darkweb_threat\data\clydeiii"

# Collect all text files
texts = []
for filename in os.listdir(data_folder):
    if filename.endswith(".txt"):
        filepath = os.path.join(data_folder, filename)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().strip()
            texts.append({"year_file": filename, "text": content})

# Convert to DataFrame
df = pd.DataFrame(texts)

# Save combined file
output_path = r"C:\Users\Administrator\darkweb_threat\data\clydeiii_cybersecurity_clean.csv"
df.to_csv(output_path, index=False, encoding="utf-8")

print(f"✅ Combined {len(df)} text files into one CSV:")
print(f"📁 Saved to: {output_path}")
