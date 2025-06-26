"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TrendingUp, CheckCircle, AlertCircle } from "lucide-react"

interface FormData {
  apiKey: string
  secretKey: string
  sessionToken: string
}

interface ApiResponse {
  success: boolean
  message: string
}

export default function TradingApp() {
  const [formData, setFormData] = useState<FormData>({
    apiKey: "",
    secretKey: "",
    sessionToken: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.apiKey.trim()) {
      newErrors.apiKey = "API Key is required"
    }
    if (!formData.secretKey.trim()) {
      newErrors.secretKey = "Secret Key is required"
    }
    if (!formData.sessionToken.trim()) {
      newErrors.sessionToken = "Session Token is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Clear response when user modifies form
    if (response) {
      setResponse(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setResponse(null)

    try {
      const response = await fetch("/api/init-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: formData.apiKey,
          secret_key: formData.secretKey,
          session_token: formData.sessionToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResponse({
          success: true,
          message: data.message || "Session initialized successfully!",
        })
        setTimeout(() => {
          window.location.href = "/historical-data"
        }, 2000)
      } else {
        setResponse({
          success: false,
          message: data.message || "Failed to initialize session. Please check your credentials.",
        })
      }
    } catch (error) {
      setResponse({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading App</h1>
          <p className="text-gray-600">Connect to ICICI Direct BreezeConnect API</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">API Credentials</CardTitle>
            <CardDescription>
              Enter your BreezeConnect API credentials to initialize your trading session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium">
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Enter your API Key"
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange("apiKey", e.target.value)}
                  className={`transition-colors ${errors.apiKey ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.apiKey && <p className="text-sm text-red-600">{errors.apiKey}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey" className="text-sm font-medium">
                  Secret Key
                </Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter your Secret Key"
                  value={formData.secretKey}
                  onChange={(e) => handleInputChange("secretKey", e.target.value)}
                  className={`transition-colors ${errors.secretKey ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.secretKey && <p className="text-sm text-red-600">{errors.secretKey}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionToken" className="text-sm font-medium">
                  Session Token
                </Label>
                <Input
                  id="sessionToken"
                  type="text"
                  placeholder="Enter your Session Token"
                  value={formData.sessionToken}
                  onChange={(e) => handleInputChange("sessionToken", e.target.value)}
                  className={`transition-colors ${errors.sessionToken ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.sessionToken && <p className="text-sm text-red-600">{errors.sessionToken}</p>}
              </div>

              {response && (
                <Alert className={`${response.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-center gap-2">
                    {response.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription className={`${response.success ? "text-green-800" : "text-red-800"}`}>
                      {response.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing Session...
                  </>
                ) : (
                  "Initialize Session"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Your credentials are securely transmitted to initialize your trading session.
                <br />
                Make sure you have the correct API credentials from your ICICI Direct dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
