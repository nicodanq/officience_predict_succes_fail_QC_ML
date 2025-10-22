"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCw, Target, TrendingUp, Gauge, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/sonner"

interface MetricsData {
  accuracy: number
  roc_auc: number
  classification_report: {
    [key: string]: {
      precision: number
      recall: number
      "f1-score": number
      support: number
    }
  }
}

export default function MetricsPage() {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics`)
      if (!response.ok) {
        throw new Error("Failed to fetch metrics")
      }
      const data = await response.json()
      if (!data || typeof data !== "object") {
        throw new Error("Invalid metrics data received")
      }
      setMetrics(data)
      toast({
        title: "Metrics Updated",
        description: "Successfully loaded model performance metrics",
      })
    } catch (error) {
      console.log("[v0] Metrics fetch error:", error)
      setError(`Unable to load metrics. Please ensure the backend is running at ${process.env.NEXT_PUBLIC_API_URL}`)
      toast({
        variant: "error",
        title: "Fetch Error",
        description: "Unable to load metrics. Please ensure the backend is running.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Model Metrics</h1>
            <p className="text-muted-foreground mt-1">Performance evaluation of the prediction model</p>
          </div>
          <Button onClick={fetchMetrics} disabled={isLoading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>

        <Card className="glass-card border-border/50 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Metrics Available</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {error || "Unable to load metrics. Please ensure the backend server is running."}
            </p>
            <Button onClick={fetchMetrics} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Model Metrics</h1>
            <p className="text-muted-foreground mt-1">Performance evaluation of the prediction model</p>
          </div>
          <Button onClick={fetchMetrics} disabled={isLoading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-left-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Accuracy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{((metrics?.accuracy ?? 0) * 100).toFixed(2)}%</p>
              <p className="text-sm text-muted-foreground mt-2">Overall prediction accuracy</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <CardTitle>ROC AUC</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{((metrics?.roc_auc ?? 0) * 100).toFixed(2)}%</p>
              <p className="text-sm text-muted-foreground mt-2">Area under ROC curve</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Model Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-500">Active</p>
              <p className="text-sm text-muted-foreground mt-2">Ready for predictions</p>
            </CardContent>
          </Card>
        </div>

        {/* Classification Report Table */}
        <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="text-2xl">Classification Report</CardTitle>
            <CardDescription>Detailed performance metrics by class</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.classification_report && typeof metrics.classification_report === "object" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Precision</TableHead>
                    <TableHead>Recall</TableHead>
                    <TableHead>F1-Score</TableHead>
                    <TableHead>Support</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(metrics.classification_report)
                    .filter(([key]) => !["accuracy", "macro avg", "weighted avg"].includes(key))
                    .map(([className, values]) => (
                      <TableRow key={className}>
                        <TableCell className="font-medium">
                          {className === "0" ? "Failure" : className === "1" ? "Success" : className}
                        </TableCell>
                        <TableCell>{((values?.precision ?? 0) * 100).toFixed(2)}%</TableCell>
                        <TableCell>{((values?.recall ?? 0) * 100).toFixed(2)}%</TableCell>
                        <TableCell>{((values?.["f1-score"] ?? 0) * 100).toFixed(2)}%</TableCell>
                        <TableCell>{values?.support ?? 0}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No classification report data available</div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  )
}
