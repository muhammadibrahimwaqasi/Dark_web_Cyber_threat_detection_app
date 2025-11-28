from datasets import load_dataset # type: ignore
import pandas as pd, os, glob

os.makedirs("data", exist_ok=True)

def safe_read_text_files(folder_path):
    """Merge all text files from the HuggingFace cache into one dataframe."""
    files = glob.glob(os.path.join(folder_path, "*.txt"))
    texts = []
    for f in files:
        try:
            with open(f, "r", encoding="utf-8", errors="ignore") as fh:
                text = fh.read().strip()
                if text:
                    texts.append(text)
        except Exception as e:
            print(f"⚠️ Skipping {f}: {e}")
    return pd.DataFrame({"text": texts})

print("📥 Downloading: clydeiii/cybersecurity ...")
try:
    dataset1 = load_dataset("clydeiii/cybersecurity")
    # Locate cached folder (works on Windows)
    cache_path = os.path.expanduser("~/.cache/huggingface/hub/datasets--clydeiii--cybersecurity")
    df1 = safe_read_text_files(cache_path)
    df1.to_csv("data/cybersecurity_clydeiii.csv", index=False)
    print(f"✅ Saved {len(df1)} rows to data/cybersecurity_clydeiii.csv")
except Exception as e:
    print("❌ Clydeiii dataset failed:", e)

print("📥 Downloading: mrmoor/cyber-threat-intelligence ...")
try:
    ds2 = load_dataset("mrmoor/cyber-threat-intelligence", split="train")
    df2 = ds2.to_pandas()
    df2.to_csv("data/cyber_threat_intel_mrmoor.csv", index=False)
    print(f"✅ Saved {len(df2)} rows to data/cyber_threat_intel_mrmoor.csv")
except Exception as e:
    print("❌ MrMoor dataset failed:", e)

print("🎉 Done! Check your data/ folder.")
