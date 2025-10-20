import pandas as pd
import joblib
from pathlib import Path
import os
from dotenv import load_dotenv
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report, confusion_matrix
import seaborn as sns
from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib.pyplot as plt

# Charger les variables d'environnement
load_dotenv()

PROCESSED_DIR = Path(os.getenv("PROCESSED_DIR"))
MODELS_DIR = Path(os.getenv("MODELS_DIR"))

model_path= MODELS_DIR / "qc_baseline_model.joblib"
clf = joblib.load(model_path)
print(f"EVALUATE : ✅ Loaded model from {model_path}")

X_test = pd.read_csv(PROCESSED_DIR / "x_test.csv")
y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()
print("✅ Test data loaded:", X_test.shape, y_test.shape)

y_pred = clf.predict(X_test)
y_proba = clf.predict_proba(X_test)[:, 1]

print (f"EVALUATE : ",y_pred,"et",y_proba)

acc = accuracy_score(y_test, y_pred)
roc  = roc_auc_score(y_test, y_proba)
fpr, tpr, thresholds = roc_curve(y_test, y_proba)

print(f"EVALUATE : 📊 Accuracy: {acc:.3f}")
print(f"EVALUATE : 📈 ROC AUC: {roc:.3f}")
print("\n EVALUATE : Detailed classification report:\n")
print(classification_report(y_test, y_pred))


cm=confusion_matrix(y_test, y_pred)
plt.figure(figsize=(5,4))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Confusion Matrix")
plt.show()

plt.figure(figsize=(6,6))
plt.plot(fpr, tpr, color='royalblue', lw=2, label=f"ROC curve (AUC = {roc:.3f})")
plt.plot([0, 1], [0, 1], color='gray', linestyle='--')  # diagonale aléatoire
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate (Recall)")
plt.title("Receiver Operating Characteristic (ROC)")
plt.legend()
plt.show()