"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/sonner"

interface GraphsData {
  confusion_matrix: string
  roc_curve: string
  proba_distribution: string
  feature_importance: string
  calibration_curve: string
}

export default function VisualizationsPage() {
  const { toast } = useToast()
  const [graphs, setGraphs] = useState<GraphsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchGraphs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://127.0.0.1:8000/graphs")
      if (!response.ok) {
        throw new Error("Failed to fetch graphs")
      }
      const data = await response.json()
      setGraphs(data)
      toast({
        title: "Graphs Updated",
        description: "Successfully loaded visualization graphs",
      })
    } catch (error) {
      console.error("[v0] Graphs fetch error:", error)
      toast({
        variant: "error",
        title: "Fetch Error",
        description: "Unable to load graphs. Please ensure the backend is running.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGraphs()
  }, [])

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Model Visualizations</h1>
            <p className="text-muted-foreground mt-1">Comprehensive model performance analysis</p>
          </div>
          <Button onClick={fetchGraphs} disabled={isLoading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Loading visualizations...</p>
            </div>
          </div>
        )}

        {/* Graphs Display */}
        {!isLoading && graphs && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-left-4 duration-500">
              <CardHeader>
                <CardTitle className="text-2xl">Confusion Matrix</CardTitle>
                <CardDescription>True vs Predicted classifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-square bg-background/30 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${graphs.confusion_matrix}`}
                    alt="Confusion Matrix"
                    className="w-full h-full object-contain rounded-xl shadow-md"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ROC Curve */}
            <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="text-2xl">ROC Curve</CardTitle>
                <CardDescription>
                  Receiver Operating Characteristic showing trade-off between true positive and false positive rates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-square bg-background/30 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${graphs.roc_curve}`}
                    alt="ROC Curve"
                    className="w-full h-full object-contain rounded-xl shadow-md"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
              <CardHeader>
                <CardTitle className="text-2xl">Probability Distribution</CardTitle>
                <CardDescription>
                  Histogram of predicted success probabilities to visualize model confidence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-square bg-background/30 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${graphs.proba_distribution}`}
                    alt="Probability Distribution"
                    className="w-full h-full object-contain rounded-xl shadow-md"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
              <CardHeader>
                <CardTitle className="text-2xl">Feature Importance</CardTitle>
                <CardDescription>Top 10 most influential variables in the model.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-square bg-background/30 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${graphs.feature_importance}`}
                    alt="Feature Importance"
                    className="w-full h-full object-contain rounded-xl shadow-md"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
              <CardHeader>
                <CardTitle className="text-2xl">Calibration Curve</CardTitle>
                <CardDescription>Checks if predicted probabilities match the observed outcomes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-square bg-background/30 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${graphs.calibration_curve}`}
                    alt="Calibration Curve"
                    className="w-full h-full object-contain rounded-xl shadow-md"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Toaster />
    </>
  )
}
