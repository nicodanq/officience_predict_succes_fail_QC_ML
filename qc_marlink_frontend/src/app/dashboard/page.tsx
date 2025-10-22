"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, LineChart, BarChart3, Clock } from "lucide-react"
import Link from "next/link"

interface LastPrediction {
  prediction: number
  probability: number
  timestamp: string
}

export default function DashboardPage() {
  const [lastPrediction, setLastPrediction] = useState<LastPrediction | null>(null)

  useEffect(() => {
    // Load last prediction from localStorage
    const stored = localStorage.getItem("lastPrediction")
    if (stored) {
      setLastPrediction(JSON.parse(stored))
    }
  }, [])

  const cards = [
    {
      title: "Make a Prediction",
      description: "Analyze connection quality with AI",
      icon: Brain,
      href: "/predict",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "View Model Metrics",
      description: "Accuracy, ROC AUC, and more",
      icon: BarChart3,
      href: "/metrics",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Visualizations",
      description: "Confusion matrix and ROC curve",
      icon: LineChart,
      href: "/visualizations",
      gradient: "from-pink-500 to-rose-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-bold text-balance mb-3">Welcome to AI QC Predictor</h1>
        <p className="text-lg text-muted-foreground">
          Predict connection quality using advanced machine learning models
        </p>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link
            key={card.title}
            href={card.href}
            className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card className="glass-card border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">{card.title}</CardTitle>
                <CardDescription className="text-base">{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Last Prediction Summary */}
      {lastPrediction && (
        <Card className="glass-card border-border/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-xl">Last Prediction</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Result</p>
                <p className="text-2xl font-bold">{lastPrediction.prediction === 1 ? "Success ✅" : "Failure ❌"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                <p className="text-2xl font-bold">{Math.round(lastPrediction.probability * 100)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time</p>
                <p className="text-sm font-medium">{new Date(lastPrediction.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
