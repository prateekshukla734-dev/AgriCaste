# ml-service/train/train_classifier.py
import os
import sys
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# default relative paths to try (relative to this script's directory)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CANDIDATE_REL_PATHS = [
    os.path.join(SCRIPT_DIR, "..", "data", "Crop_Recommendation_dataset.csv"),   # ../data/
    os.path.join(SCRIPT_DIR, "data", "Crop_Recommendation_dataset.csv"),        # train/data/
    os.path.join(SCRIPT_DIR, "..", "data", "Crop_recommendation.csv"),         # alternate name
    os.path.join(SCRIPT_DIR, "..", "data", "Crop_recommendation_dataset.csv"),
    os.path.join(SCRIPT_DIR, "..", "data", "crop_recommendation.csv"),
    os.path.join(SCRIPT_DIR, "..", "data", "Crop_Recommendation.csv"),
]

def find_csv():
    # 1) env var override
    env_path = os.getenv("TRAIN_CLASSIFIER_CSV")
    if env_path:
        env_path = os.path.expanduser(env_path)
        if os.path.exists(env_path):
            print(f"Using CSV from TRAIN_CLASSIFIER_CSV: {env_path}")
            return env_path
        else:
            print(f"TRAIN_CLASSIFIER_CSV is set but file not found: {env_path}")

    # 2) try candidate paths
    for p in CANDIDATE_REL_PATHS:
        p_abs = os.path.abspath(p)
        if os.path.exists(p_abs):
            print(f"Found dataset at: {p_abs}")
            return p_abs

    # 3) try common absolute paths (example windows D: folder)
    common_alt = [
        r"D:\SIH\Dataset1\Crop_Recommendation_dataset.csv",
        r"D:\SIH\Dataset1\Crop_recommendation.csv",
        r"C:\Users\{user}\Downloads\Crop_Recommendation_dataset.csv".format(user=os.getlogin())
    ]
    for p in common_alt:
        if os.path.exists(p):
            print(f"Found dataset at: {p}")
            return p

    # not found
    return None

def run():
    DATA_CSV = find_csv()
    if not DATA_CSV:
        print("ERROR: Training CSV not found. Tried these locations:")
        for p in CANDIDATE_REL_PATHS:
            print(" -", os.path.abspath(p))
        print("\nYou can set the environment variable TRAIN_CLASSIFIER_CSV to the CSV full path, e.g.:")
        print(r'  $env:TRAIN_CLASSIFIER_CSV = "D:\SIH\Dataset1\Crop_recommendation16.csv"')
        sys.exit(2)

    print("Loading dataset:", DATA_CSV)
    df = pd.read_csv(DATA_CSV)
    # normalize column names
    df.columns = [c.strip() for c in df.columns]

    expected_cols = ['Nitrogen','Phosphorus','Potassium','Temperature','Humidity','pH_Value','Rainfall','Crop']
    missing = [c for c in expected_cols if c not in df.columns]
    if missing:
        print("ERROR: Missing expected columns in CSV:", missing)
        print("CSV columns are:", list(df.columns))
        sys.exit(3)

    df = df[expected_cols].dropna()
    X = df[['Nitrogen','Phosphorus','Potassium','Temperature','Humidity','pH_Value','Rainfall']]
    y = df['Crop'].astype(str)

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42, stratify=y_enc)

    clf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print("Training complete. Test accuracy:", acc)
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    out_dir = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "models"))
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "crop_classifier.joblib")
    joblib.dump({'model': clf, 'le': le}, out_path)
    print("Saved classifier to:", out_path)

if __name__ == "__main__":
    run()
