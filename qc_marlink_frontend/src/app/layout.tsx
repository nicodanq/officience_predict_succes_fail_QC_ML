import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Sidebar from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI QC Predictor - Connection Quality Prediction",
  description: "AI-powered connection quality prediction tool",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <div className="min-h-screen gradient-bg">
          <Sidebar />
          <main className="lg:pl-64">
            <div className="p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">{children}</div>
            </div>
          </main>
        </div>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
