"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, BarChart3, PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface PredictionResultProps {
  prediction: number
  probability: number
  topPositive?: Array<{
    feature: string
    impact: number
  }>
  topNegative?: Array<{
    feature: string
    impact: number
  }>
  explanation?: string
}

export default function PredictionResult({
  prediction,
  probability,
  topPositive,
  topNegative,
  explanation,
}: PredictionResultProps) {
  const [animatedProbability, setAnimatedProbability] = useState(0)
  const [viewMode, setViewMode] = useState<"bars" | "pie">("bars")
  const isSuccess = prediction === 1

  const confidence = probability != null ? (probability * 100).toFixed(1) : null
  const confidenceNum = probability != null ? probability * 100 : 0

  const getConfidenceMessage = () => {
    if (confidence === null) return "Data not available"
    if (confidenceNum >= 85) return "Excellent Confidence"
    if (confidenceNum >= 60) return "Moderate Confidence"
    return "Low Confidence"
  }

  const getConfidenceColor = () => {
    if (confidenceNum > 85) return "#10b981"
    if (confidenceNum >= 60) return "#f97316"
    return "#ef4444"
  }

  const cleanFeatureName = (feature: string): string => {
    // Remove "num__" and "cat__" prefixes
    const cleaned = feature.replace(/^(num__|cat__)/, "")
    // Convert snake_case to Title Case
    return cleaned
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProbability(confidenceNum)
    }, 100)
    return () => clearTimeout(timer)
  }, [confidenceNum])

  const positiveChartData =
    topPositive?.map((item) => ({
      name: cleanFeatureName(item.feature),
      value: item.impact,
    })) || []

  const negativeChartData =
    topNegative?.map((item) => ({
      name: cleanFeatureName(item.feature),
      value: Math.abs(item.impact),
    })) || []

  // Color palettes for pie charts
  const POSITIVE_COLORS = [
    "#10b981", // emerald-500
    "#22c55e", // green-500
    "#84cc16", // lime-500
    "#16a34a", // green-600
    "#65a30d", // lime-600
    "#059669", // emerald-600
    "#14532d", // green-900
  ]

  const NEGATIVE_COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#fb923c", // orange-400
    "#dc2626", // red-600
    "#ea580c", // orange-600
    "#f59e0b", // amber-500
    "#b91c1c", // red-700
  ]

  const maxPositiveImpact = topPositive && topPositive.length > 0 ? Math.max(...topPositive.map((r) => r.impact)) : 1
  const maxNegativeImpact =
    topNegative && topNegative.length > 0 ? Math.max(...topNegative.map((r) => Math.abs(r.impact))) : 1

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="glass-card border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Prediction Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            {isSuccess ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <span className="text-2xl font-bold text-green-500">Success Probable</span>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-500" />
                <span className="text-2xl font-bold text-red-500">Failure Probable</span>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-muted-foreground">Confidence Level</span>
              <span className="text-foreground font-bold">
                {confidence !== null ? `${confidence}%` : "Data not available"}
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${animatedProbability}%`,
                  backgroundColor: getConfidenceColor(),
                }}
              />
            </div>
            <p className="text-sm font-medium text-center" style={{ color: getConfidenceColor() }}>
              {getConfidenceMessage()}
            </p>
          </div>

          {(topPositive || topNegative) && (
            <div className="pt-4 border-t border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Impact Analysis</h3>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "bars" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("bars")}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Bars
                  </Button>
                  <Button
                    variant={viewMode === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("pie")}
                  >
                    <PieChartIcon className="h-4 w-4 mr-1" />
                    Chart
                  </Button>
                </div>
              </div>

              {viewMode === "bars" ? (
                <div className="space-y-6">
                  {/* Positive Factors */}
                  {topPositive && topPositive.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <h4 className="text-base font-semibold text-green-500">Positive Factors (Favoring Success)</h4>
                      </div>
                      <div className="space-y-3">
                        {topPositive.map((reason, index) => {
                          const impactPercentage = (reason.impact / maxPositiveImpact) * 100

                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">{cleanFeatureName(reason.feature)}</span>
                                <span className="text-green-500 font-mono">+{reason.impact.toFixed(3)}</span>
                              </div>
                              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full transition-all duration-700 ease-out bg-green-500"
                                  style={{
                                    width: `${impactPercentage}%`,
                                    transitionDelay: `${index * 100}ms`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Negative Factors */}
                  {topNegative && topNegative.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        <h4 className="text-base font-semibold text-red-500">Negative Factors (Limiting Success)</h4>
                      </div>
                      <div className="space-y-3">
                        {topNegative.map((reason, index) => {
                          const impactPercentage = (Math.abs(reason.impact) / maxNegativeImpact) * 100

                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">{cleanFeatureName(reason.feature)}</span>
                                <span className="text-red-500 font-mono">{reason.impact.toFixed(3)}</span>
                              </div>
                              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full transition-all duration-700 ease-out bg-red-500"
                                  style={{
                                    width: `${impactPercentage}%`,
                                    transitionDelay: `${index * 100}ms`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Distribution of individual factors by impact
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Positive Factors Pie Chart */}
                    {positiveChartData.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <h4 className="text-base font-semibold text-green-500">Positive Factors</h4>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={positiveChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {positiveChartData.map((entry, index) => (
                                <Cell
                                  key={`positive-cell-${index}`}
                                  fill={POSITIVE_COLORS[index % POSITIVE_COLORS.length]}
                                  stroke={POSITIVE_COLORS[index % POSITIVE_COLORS.length]}
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              formatter={(value: number) => `+${value.toFixed(3)}`}
                            />
                            <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                          <p className="text-sm text-muted-foreground mb-1">Total Positive Impact</p>
                          <p className="text-xl font-bold text-green-500">
                            +{positiveChartData.reduce((sum, item) => sum + item.value, 0).toFixed(3)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Negative Factors Pie Chart */}
                    {negativeChartData.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                          <h4 className="text-base font-semibold text-red-500">Negative Factors</h4>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={negativeChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {negativeChartData.map((entry, index) => (
                                <Cell
                                  key={`negative-cell-${index}`}
                                  fill={NEGATIVE_COLORS[index % NEGATIVE_COLORS.length]}
                                  stroke={NEGATIVE_COLORS[index % NEGATIVE_COLORS.length]}
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              formatter={(value: number) => `-${value.toFixed(3)}`}
                            />
                            <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                          <p className="text-sm text-muted-foreground mb-1">Total Negative Impact</p>
                          <p className="text-xl font-bold text-red-500">
                            -{negativeChartData.reduce((sum, item) => sum + item.value, 0).toFixed(3)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {explanation && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground leading-relaxed">{explanation}</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              {isSuccess
                ? "The connection quality is predicted to be stable and reliable."
                : "The connection quality may experience issues or interruptions."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
