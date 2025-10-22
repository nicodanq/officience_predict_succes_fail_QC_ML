"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import PredictionResult from "@/components/prediction-result"
import { Loader2 } from "lucide-react"

interface FormData {
  snr: string
  rssi: string
  distance: string
  latency_bt: string
  latency_sat: string
  temperature: string
  humidity: string
  battery: string
  latitude: string
  longitude: string
  altitude: string
  hour: string
  day_of_week: string
  is_night: string
  firmware: string
  time_of_day: string
}

interface PredictionResponse {
  prediction: number
  probability: number
}

export default function PredictionForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)

  const [formData, setFormData] = useState<FormData>({
    snr: "",
    rssi: "",
    distance: "",
    latency_bt: "",
    latency_sat: "",
    temperature: "",
    humidity: "",
    battery: "",
    latitude: "",
    longitude: "",
    altitude: "",
    hour: "",
    day_of_week: "",
    is_night: "0",
    firmware: "v1.0",
    time_of_day: "morning",
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      // Convert form data to numbers where needed
      const payload = {
        snr: Number.parseFloat(formData.snr),
        rssi: Number.parseFloat(formData.rssi),
        distance: Number.parseFloat(formData.distance),
        latency_bt: Number.parseFloat(formData.latency_bt),
        latency_sat: Number.parseFloat(formData.latency_sat),
        temperature: Number.parseFloat(formData.temperature),
        humidity: Number.parseFloat(formData.humidity),
        battery: Number.parseFloat(formData.battery),
        latitude: Number.parseFloat(formData.latitude),
        longitude: Number.parseFloat(formData.longitude),
        altitude: Number.parseFloat(formData.altitude),
        hour: Number.parseInt(formData.hour),
        day_of_week: Number.parseInt(formData.day_of_week),
        is_night: Number.parseInt(formData.is_night),
        firmware: formData.firmware,
        time_of_day: formData.time_of_day,
      }

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("[v0] Prediction error:", error)
      toast({
        variant: "destructive",
        title: "Prediction Error",
        description: "Unable to connect to the prediction API. Please ensure the backend is running.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="glass-card border-border/50 shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-balance">Connection Quality Prediction</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter technical measurements to predict connection quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Signal Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Signal Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="snr">SNR (Signal-to-Noise Ratio)</Label>
                  <Input
                    id="snr"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 15.5"
                    value={formData.snr}
                    onChange={(e) => handleInputChange("snr", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rssi">RSSI (dBm)</Label>
                  <Input
                    id="rssi"
                    type="number"
                    step="0.01"
                    placeholder="e.g., -70"
                    value={formData.rssi}
                    onChange={(e) => handleInputChange("rssi", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (meters)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 150.5"
                    value={formData.distance}
                    onChange={(e) => handleInputChange("distance", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="battery">Battery (%)</Label>
                  <Input
                    id="battery"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 85.5"
                    value={formData.battery}
                    onChange={(e) => handleInputChange("battery", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            {/* Latency Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Latency Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latency_bt">Bluetooth Latency (ms)</Label>
                  <Input
                    id="latency_bt"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 25.5"
                    value={formData.latency_bt}
                    onChange={(e) => handleInputChange("latency_bt", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latency_sat">Satellite Latency (ms)</Label>
                  <Input
                    id="latency_sat"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 120.5"
                    value={formData.latency_sat}
                    onChange={(e) => handleInputChange("latency_sat", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            {/* Environmental Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Environmental Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 22.5"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange("temperature", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 65.5"
                    value={formData.humidity}
                    onChange={(e) => handleInputChange("humidity", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            {/* Location Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Location Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 48.8566"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    placeholder="e.g., 2.3522"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altitude">Altitude (meters)</Label>
                  <Input
                    id="altitude"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 35.0"
                    value={formData.altitude}
                    onChange={(e) => handleInputChange("altitude", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            {/* Temporal Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Temporal Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hour">Hour (0-23)</Label>
                  <Input
                    id="hour"
                    type="number"
                    min="0"
                    max="23"
                    placeholder="e.g., 14"
                    value={formData.hour}
                    onChange={(e) => handleInputChange("hour", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Day of Week (0-6)</Label>
                  <Input
                    id="day_of_week"
                    type="number"
                    min="0"
                    max="6"
                    placeholder="e.g., 3 (Wednesday)"
                    value={formData.day_of_week}
                    onChange={(e) => handleInputChange("day_of_week", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_night">Is Night?</Label>
                  <Select value={formData.is_night} onValueChange={(value) => handleInputChange("is_night", value)}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No (Day)</SelectItem>
                      <SelectItem value="1">Yes (Night)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_of_day">Time of Day</Label>
                  <Select
                    value={formData.time_of_day}
                    onValueChange={(value) => handleInputChange("time_of_day", value)}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* System Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firmware">Firmware Version</Label>
                  <Select value={formData.firmware} onValueChange={(value) => handleInputChange("firmware", value)}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1.0">v1.0</SelectItem>
                      <SelectItem value="v1.1">v1.1</SelectItem>
                      <SelectItem value="v2.0">v2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Predict Quality"
              )}
            </Button>
          </form>

          {/* Results Section */}
          {result && (
            <div className="mt-8">
              <PredictionResult prediction={result.prediction} probability={result.probability} />
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </>
  )
}
