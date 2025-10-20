from pydantic import BaseModel

class PredictRequest(BaseModel):
    snr: float
    rssi: float
    distance: float
    latency_bt: float
    latency_sat: float
    temperature: float
    humidity: float
    battery: float
    latitude: float
    longitude: float
    altitude: float
    hour: float
    day_of_week: float
    is_night: float
    firmware: str
    time_of_day: str
