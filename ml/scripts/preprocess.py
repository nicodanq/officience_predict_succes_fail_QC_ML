from dotenv import load_dotenv
import os
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from features_utils import add_time_features

load_dotenv()

DATA_PATH = Path(os.getenv("DATA_PATH"))
PROCESSED_DIR = Path(os.getenv("PROCESSED_DIR"))
SEED = int(os.getenv("SEED"))

df = pd.read_csv(DATA_PATH)

Path(PROCESSED_DIR).mkdir(parents=True, exist_ok=True)

# print(f"PREPROCESS : ✅ Data loaded: {df.shape[0]} rows × {df.shape[1]} columns")
# print(df.head())

# print(f"PREPROCESS : types: {df.dtypes}")
# print(f"PREPROCESS : missing values: {df.isna().sum()}")

# print(f"PREPROCESS : success counts: {df['success'].value_counts(normalize=True)}")
df = add_time_features(df)

x=df.drop(columns=["success"])
y=df["success"]

x_train, x_test, y_train, y_test = train_test_split(x,y, test_size=0.2, stratify=y, random_state=SEED)

x_train.to_csv(PROCESSED_DIR/"x_train.csv", index= False)
x_test.to_csv(PROCESSED_DIR/"x_test.csv", index= False)
y_train.to_csv(PROCESSED_DIR/"y_train.csv", index= False)
y_test.to_csv(PROCESSED_DIR/"y_test.csv", index= False)
