"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/sonner"
import PredictionResult from "@/components/prediction-result"
import { Loader2, Upload, FileJson, FormInput, CheckCircle2, XCircle, BarChart3 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

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
  success_proba: number
  top_positive?: Array<{
    feature: string
    impact: number
  }>
  top_negative?: Array<{
    feature: string
    impact: number
  }>
  explanation?: string
}

interface BatchPredictionResponse {
  rows: number
  success_rate: number
  avg_confidence: number
  success_count: number
  fail_count: number
  preview: Array<{
    prediction: number
    success_proba: number
    snr?: number
    rssi?: number
    distance?: number
    latency_bt?: number
    [key: string]: unknown
  }>
}

export default function PredictPage() {
  const { toast } = useToast()
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [isBatchLoading, setIsBatchLoading] = useState(false)
  const [isJsonLoading, setIsJsonLoading] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [jsonInput, setJsonInput] = useState("")
  const [batchResult, setBatchResult] = useState<BatchPredictionResponse | null>(null)

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormLoading(true)
    setResult(null)

    try {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
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
      setResult({
        prediction: data.prediction,
        success_proba: data.success_proba,
        top_positive: data.top_positive,
        top_negative: data.top_negative,
        explanation: data.explanation,
      })

      localStorage.setItem(
        "lastPrediction",
        JSON.stringify({
          prediction: data.prediction,
          probability: data.success_proba,
          timestamp: new Date().toISOString(),
        }),
      )

      toast({
        title: "Prediction Complete",
        description: `Result: ${data.prediction === 1 ? "Success" : "Failure"} (${Math.round(data.success_proba * 100)}% confidence)`,
      })
    } catch (error) {
      toast({
        variant: "error",
        title: "Prediction Error",
        description: "Unable to connect to the prediction API. Please ensure the backend is running.",
      })
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleBatchPredict = async () => {
    if (!csvFile) {
      toast({
        variant: "error",
        title: "No File Selected",
        description: "Please select a CSV file first.",
      })
      return
    }

    setIsBatchLoading(true)
    setBatchResult(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", csvFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict_csv`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Batch prediction failed")
      }

      const data = await response.json()

      setBatchResult({
        rows: data.rows || 0,
        success_rate: data.success_rate || 0,
        avg_confidence: data.avg_confidence || 0,
        success_count: data.success_count || 0,
        fail_count: data.fail_count || 0,
        preview: data.preview || [],
      })

      toast({
        title: "Batch Processing Complete",
        description: `Analyzed ${data.rows} rows with ${data.success_rate.toFixed(1)}% success rate`,
      })
    } catch (error) {
      toast({
        variant: "error",
        title: "Upload Error",
        description: "Unable to process CSV file. Please check the format and try again.",
      })
    } finally {
      setIsBatchLoading(false)
    }
  }

  const handleJsonPredict = async () => {
    if (!jsonInput.trim()) {
      toast({
        variant: "error",
        title: "Empty Input",
        description: "Please enter JSON data first.",
      })
      return
    }

    setIsJsonLoading(true)
    setResult(null)

    try {
      const payload = JSON.parse(jsonInput)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
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
      setResult({
        prediction: data.prediction,
        success_proba: data.success_proba,
        top_positive: data.top_positive,
        top_negative: data.top_negative,
        explanation: data.explanation,
      })

      localStorage.setItem(
        "lastPrediction",
        JSON.stringify({
          prediction: data.prediction,
          probability: data.success_proba,
          timestamp: new Date().toISOString(),
        }),
      )

      toast({
        title: "Prediction Complete",
        description: `Result: ${data.prediction === 1 ? "Success" : "Failure"} (${Math.round(data.success_proba * 100)}% confidence)`,
      })
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast({
          variant: "error",
          title: "Invalid JSON Input",
          description: "Please check your JSON syntax and try again.",
        })
      } else {
        toast({
          variant: "error",
          title: "Prediction Error",
          description: "Unable to connect to the prediction API. Please ensure the backend is running.",
        })
      }
    } finally {
      setIsJsonLoading(false)
    }
  }

  const chartData = batchResult
    ? [
        { name: "Success", value: batchResult.success_count, color: "#22c55e" },
        { name: "Failure", value: batchResult.fail_count, color: "#ef4444" },
      ]
    : []

  return (
    <>
      <div className="space-y-6">
        {/* Batch Prediction Section */}
        <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-bold">Batch Prediction</CardTitle>
            </div>
            <CardDescription>Upload a CSV file for multiple predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                disabled={isBatchLoading}
                className="bg-background/50"
              />
            </div>
            <Button onClick={handleBatchPredict} disabled={isBatchLoading || !csvFile} className="w-full" size="lg">
              {isBatchLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Predict from File
                </>
              )}
            </Button>

            {batchResult && (
              <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Summary Card */}
                <Card className="bg-background/50 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Batch Prediction Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-muted-foreground">Rows Processed</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">{batchResult.rows}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <p className="text-sm font-medium text-muted-foreground">Success Count</p>
                        </div>
                        <p className="text-2xl font-bold text-green-500">{batchResult.success_count}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <p className="text-sm font-medium text-muted-foreground">Fail Count</p>
                        </div>
                        <p className="text-2xl font-bold text-red-500">{batchResult.fail_count}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-500">{batchResult.success_rate.toFixed(1)}%</p>
                      </div>

                      <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20 md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-violet-500" />
                          <p className="text-sm font-medium text-muted-foreground">Average Confidence</p>
                        </div>
                        <p className="text-2xl font-bold text-violet-500">{batchResult.avg_confidence.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-4 text-center">Success vs Failure Distribution</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Preview Table */}
                    {batchResult.preview && batchResult.preview.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-3">Preview (First 5 Rows)</h4>
                        <div className="overflow-x-auto rounded-lg border border-border/50">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold">Prediction</th>
                                <th className="px-4 py-3 text-left font-semibold">Confidence</th>
                                <th className="px-4 py-3 text-left font-semibold">SNR</th>
                                <th className="px-4 py-3 text-left font-semibold">RSSI</th>
                                <th className="px-4 py-3 text-left font-semibold">Distance</th>
                                <th className="px-4 py-3 text-left font-semibold">Latency BT</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batchResult.preview.slice(0, 5).map((row, index) => (
                                <tr key={index} className="border-t border-border/50 hover:bg-muted/30">
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        row.prediction === 1
                                          ? "bg-green-500/20 text-green-500"
                                          : "bg-red-500/20 text-red-500"
                                      }`}
                                    >
                                      {row.prediction === 1 ? (
                                        <>
                                          <CheckCircle2 className="h-3 w-3" />
                                          Success
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="h-3 w-3" />
                                          Failure
                                        </>
                                      )}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-medium">{(row.success_proba * 100).toFixed(1)}%</td>
                                  <td className="px-4 py-3">{row.snr?.toFixed(2) ?? "N/A"}</td>
                                  <td className="px-4 py-3">{row.rssi?.toFixed(2) ?? "N/A"}</td>
                                  <td className="px-4 py-3">{row.distance?.toFixed(2) ?? "N/A"}</td>
                                  <td className="px-4 py-3">{row.latency_bt?.toFixed(2) ?? "N/A"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form-based Prediction Section */}
        <Card className="glass-card border-border/50 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <FormInput className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-bold">Manual Form Prediction</CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">
              Enter technical measurements to predict connection quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-8">
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

              {/* Form Prediction Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isFormLoading}
              >
                {isFormLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FormInput className="mr-2 h-5 w-5" />
                    Predict from Form
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* JSON-based Prediction Section */}
        <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-bold">Direct JSON Input</CardTitle>
            </div>
            <CardDescription>Paste JSON data directly for quick predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-input">JSON Data</Label>
              <Textarea
                id="json-input"
                placeholder={`{
  "snr": 15.5,
  "rssi": -70,
  "distance": 150.5,
  "latency_bt": 25.5,
  "latency_sat": 120.5,
  "temperature": 22.5,
  "humidity": 65.5,
  "battery": 85.5,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "altitude": 35.0,
  "hour": 14,
  "day_of_week": 3,
  "is_night": 0,
  "firmware": "v1.0",
  "time_of_day": "afternoon"
}`}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="font-mono text-sm bg-background/50 min-h-[300px]"
                disabled={isJsonLoading}
              />
            </div>
            <Button onClick={handleJsonPredict} disabled={isJsonLoading} className="w-full" size="lg">
              {isJsonLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileJson className="mr-2 h-5 w-5" />
                  Predict from JSON
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PredictionResult
              prediction={result.prediction}
              probability={result.success_proba}
              topPositive={result.top_positive}
              topNegative={result.top_negative}
              explanation={result.explanation}
            />
          </div>
        )}
      </div>
      <Toaster />
    </>
  )
}
