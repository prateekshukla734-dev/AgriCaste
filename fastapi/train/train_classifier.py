# ml-service/train/train_classifier.py
"""
Train a RandomForest classifier for crop recommendation.
Produces: models/crop_classifier.joblib  (dict with 'model' & 'le')
Expect dataset CSV with columns:
  Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH_Value, Rainfall, Crop
Adjust paths/columns as needed.
"""
import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

DATA_CSV = os.getenv("TRAIN_CLASSIFIER_CSV", "data/Crop_Recommendation_dataset.csv")
OUT_MODEL = os.getenv("CROP_MODEL_OUT", "../models/crop_classifier.joblib")  # relative to train/
os.makedirs(os.path.dirname(OUT_MODEL), exist_ok=True)

def run():
    if not os.path.exists(DATA_CSV):
        raise FileNotFoundError(f"Training CSV not found at {DATA_CSV}")

    df = pd.read_csv(DATA_CSV)
    expected_cols = ['Nitrogen','Phosphorus','Potassium','Temperature','Humidity','pH_Value','Rainfall','Crop']
    missing = [c for c in expected_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in training CSV: {missing}")

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

    # save model + label encoder together
    joblib.dump({'model': clf, 'le': le}, OUT_MODEL)
    print("Saved classifier to:", OUT_MODEL)

if __name__ == "__main__":
    run()
