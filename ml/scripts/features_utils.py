import pandas as pd

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Convert timestamp into meaningful features (hour, day_of_week, is_night)
    and drop the raw timestamp.
    """
    if "timestamp" in df.columns:
        ts = pd.to_datetime(df["timestamp"])
        df["hour"] = ts.dt.hour
        df["day_of_week"] = ts.dt.dayofweek
        df["is_night"] = ((ts.dt.hour < 6) | (ts.dt.hour > 20)).astype(int)
        df = df.drop(columns=["timestamp"])
    return df
