import pandas as pd
from pathlib import Path
import os
from dotenv import load_dotenv

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder  
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

import joblib
# StandardScaler() → normalise les variables numériques (centrées sur 0, écart-type 1)
# OneHotEncoder() → transforme les variables catégorielles en colonnes binaires (0/1)
# ColumnTransformer() → permet d’appliquer les deux en même temps, sur les bons types de colonnes.

load_dotenv()

PROCESSED_DIR = Path(os.getenv("PROCESSED_DIR"))
MODELS_DIR = Path(os.getenv("MODELS_DIR"))
SEED = int(os.getenv("SEED"))

Path(MODELS_DIR).mkdir(parents=True, exist_ok=True)

x_train = pd.read_csv(PROCESSED_DIR / "x_train.csv")
x_test = pd.read_csv(PROCESSED_DIR / "x_test.csv")
y_train = pd.read_csv(PROCESSED_DIR / "y_train.csv").squeeze()  # .squeeze() → pour obtenir un vecteur 1D
y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze() 

# print("TRAIN : ✅ Train data shape:", x_train.shape, y_train.shape)
# print("TRAIN : ✅ Test data shape:", x_test.shape, y_test.shape)

# x_train = x_train.convert_dtypes()

num_cols = x_train.select_dtypes(include=["int64", "float64"]).columns.tolist()
cat_cols = x_train.select_dtypes(include=["object"]).columns.tolist()

print("TRAIN : Numerical columns:", num_cols)
print("TRAIN : Categorical columns:", cat_cols)

prepoc = ColumnTransformer([
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)
])

# print("TRAIN : ✅ Preprocessor ready with:")
# print("         - numeric features:", len(num_cols))
# print("         - categorical features:", len(cat_cols))

clf = Pipeline([
    ("preproc", prepoc),
    ("model", LogisticRegression(max_iter=1000, random_state=SEED))
])

# print("TRAIN :",clf)

clf.fit(x_train, y_train)
print("TRAIN : ✅ Model trained successfully.")
model = clf.named_steps["model"]
feature_names = clf.named_steps["preproc"].get_feature_names_out()

coefs = pd.DataFrame({
    "feature": feature_names,
    "coef" : model.coef_[0]
}).sort_values(by="coef", ascending=False)

print(coefs)

b = model.intercept_[0]

equation = "logit(p) ="
for feature, coef in zip(feature_names, model.coef_[0]):
    equation += f"({coef:.3f})*{feature}+"
equation += f"({b:.3f})"
print("TRAIN : ",equation)

model_path = MODELS_DIR / "qc_baseline_model.joblib"
joblib.dump(clf, model_path)

print("Saving model to:", model_path)
print("MODELS_DIR exists?", MODELS_DIR.exists())
print(f"TRAIN : 💾 Model saved at {model_path}")