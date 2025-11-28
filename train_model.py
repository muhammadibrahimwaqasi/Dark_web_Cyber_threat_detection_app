# train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
import os

os.makedirs("models", exist_ok=True)

# ----------------------------
# Safe CSV reader
# ----------------------------
def safe_read_csv(path):
    for enc in ('utf-8', 'latin1', 'ISO-8859-1'):
        try:
            df = pd.read_csv(path, encoding=enc, on_bad_lines='skip', low_memory=False)
            if df.shape[0] > 0:
                print(f"✅ Loaded {path} -> {df.shape} (encoding={enc})")
                return df
        except Exception as e:
            print(f"⚠️ Could not read {path} with {enc}: {e}")
    return pd.DataFrame()

# ----------------------------
# Load all cleaned datasets
# ----------------------------
paths = [
    "data/agora_clean.csv",
    "data/clydeiii_final_clean.csv",
    "data/mrmoor_clean.csv",
    "data/global_threats_clean.csv"
]

df_list = []
for p in paths:
    if os.path.exists(p):
        df_list.append(safe_read_csv(p))
    else:
        print(f"⚠️ File not found: {p}")

if not df_list:
    raise SystemExit("❌ No datasets found in data/ folder.")

df = pd.concat(df_list, ignore_index=True)
print("📊 Combined shape:", df.shape)

# ----------------------------
# Detect text column
# ----------------------------
text_col = None
for col in df.columns:
    if any(k in col.lower() for k in ['text', 'desc', 'summary', 'vulnerability', 'content', 'message']):
        text_col = col
        break

if not text_col:
    # if only 1 column, assume it’s text
    if df.shape[1] == 1:
        text_col = df.columns[0]
        print(f"⚙️ Defaulting to only column as text: {text_col}")
    else:
        raise SystemExit("❌ No suitable text column found.")

print("📝 Using text column:", text_col)

# ----------------------------
# Smart Labeling (threat detection)
# ----------------------------
df = df.dropna(subset=[text_col])

keywords = [
    'malware', 'attack', 'breach', 'hacked', 'ransom', 'leak', 'exploit', 'phish',
    'sell', 'selling', 'database', 'dump', 'botnet', 'stolen', 'credit', 'card',
    'hack', 'infected', 'breached', 'compromised', 'vulnerability', 'darkweb',
    'leakage', 'dumped', 'trade', 'data leak', 'information leak', 'ransomware'
]

df['label'] = df[text_col].astype(str).apply(
    lambda x: 'threat' if any(k in x.lower() for k in keywords) else 'non-threat'
)
df['label_num'] = df['label'].map({'non-threat': 0, 'threat': 1})

print("\n✅ Label distribution:")
print(df['label'].value_counts())

# If dataset too unbalanced — warn user
if df['label'].nunique() < 2:
    raise SystemExit("❌ Dataset only contains one label — check text or keywords list.")

# ----------------------------
# Train Model
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    df[text_col], df['label_num'], test_size=0.2, random_state=42, stratify=df['label_num']
)

vectorizer = TfidfVectorizer(max_features=8000, ngram_range=(1, 3), stop_words='english')
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = RandomForestClassifier(
    n_estimators=300, 
    random_state=42,
    class_weight='balanced_subsample',  # ⚡ helps if threat/non-threat ratio uneven
    n_jobs=-1
)
model.fit(X_train_vec, y_train)
preds = model.predict(X_test_vec)

print("\n✅ Model Evaluation:")
print(classification_report(y_test, preds))

# ----------------------------
# Save Model
# ----------------------------
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, os.path.join(MODEL_DIR, "cyber_model.pkl"))
joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.pkl"))
print(f"\n✅ Model and vectorizer saved successfully to {MODEL_DIR}")
