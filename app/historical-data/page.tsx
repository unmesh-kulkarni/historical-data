"use client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, TrendingUp, CheckCircle, AlertCircle, ArrowLeft, Calendar, Clock } from "lucide-react"

interface HistoricalDataParams {
    interval: string
    fromDate: string
    toDate: string
    stockCode: string
    exchangeCode: string
    productType: string
    expiryDate: string
    right: string
    strikePrice: string
}

interface HistoricalDataPoint {
    datetime: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface ApiResponse {
    success: boolean
    message?: string
    data?: HistoricalDataPoint[]
}

export default function HistoricalDataPage() {
    const [params, setParams] = useState<HistoricalDataParams>({
        interval: "1minute",
        fromDate: "2025-02-03T09:20:00.000Z",
        toDate: "2025-02-03T09:21:00.000Z",
        stockCode: "NIFTY",
        exchangeCode: "NFO",
        productType: "options",
        expiryDate: "2025-02-06T07:00:00.000Z",
        right: "call",
        strikePrice: "23200",
    })

    const [isLoading, setIsLoading] = useState(false)
    const [autoLoad, setAutoLoad] = useState(true)
    const [response, setResponse] = useState<ApiResponse | null>(null)
    const [errors, setErrors] = useState<Partial<HistoricalDataParams>>({})

    // Auto-load data on page mount
    useEffect(() => {
        if (autoLoad) {
            handleFetchData()
            setAutoLoad(false)
        }
    }, [autoLoad])

    const validateForm = (): boolean => {
        const newErrors: Partial<HistoricalDataParams> = {}

        if (!params.stockCode.trim()) newErrors.stockCode = "Stock code is required"
        if (!params.exchangeCode.trim()) newErrors.exchangeCode = "Exchange code is required"
        if (!params.strikePrice.trim()) newErrors.strikePrice = "Strike price is required"
        if (!params.fromDate) newErrors.fromDate = "From date is required"
        if (!params.toDate) newErrors.toDate = "To date is required"
        if (!params.expiryDate) newErrors.expiryDate = "Expiry date is required"

        // Validate date logic
        if (params.fromDate && params.toDate && new Date(params.fromDate) >= new Date(params.toDate)) {
            newErrors.toDate = "To date must be after from date"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof HistoricalDataParams, value: string) => {
        setParams((prev) => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const handleFetchData = async () => {
        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        setResponse(null)

        try {
            const response = await fetch("http://localhost:8000/historical", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    interval: params.interval ?? '',
                    from_date: params.fromDate,
                    to_date: params.toDate,
                    stock_code: params.stockCode,
                    exchange_code: params.exchangeCode,
                    product_type: params.productType,
                    expiry_date: params.expiryDate,
                    right: params.right,
                    strike_price: params.strikePrice,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setResponse({
                    success: true,
                    data: data.data || [],
                    message: `Retrieved ${data.data?.length || 0} data points`,
                })
            } else {
                setResponse({
                    success: false,
                    message: data.message || "Failed to fetch historical data",
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        }).format(value)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Historical Data</h1>
                            <p className="text-gray-600">Fetch ICICI Direct BreezeConnect historical market data</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Parameters Form */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-xl border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Query Parameters
                                </CardTitle>
                                <CardDescription>Configure the parameters for historical data retrieval</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Interval */}
                                <div className="space-y-2">
                                    <Label htmlFor="interval">Interval</Label>
                                    <Select value={params.interval} onValueChange={(value) => handleInputChange("interval", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1minute">1 Minute</SelectItem>
                                            <SelectItem value="5minute">5 Minutes</SelectItem>
                                            <SelectItem value="30minute">30 Minutes</SelectItem>
                                            <SelectItem value="1day">1 Day</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fromDate">From Date & Time</Label>
                                        <Input
                                            id="fromDate"
                                            type="datetime-local"
                                            value={params.fromDate.slice(0, -8)}
                                            onChange={(e) => {
                                                const dateValue = e.target.value
                                                // Add seconds if not present
                                                const formattedDate =
                                                    dateValue.includes(":") && dateValue.split(":").length === 2
                                                        ? dateValue + ":00.000Z"
                                                        : dateValue + ".000Z"
                                                handleInputChange("fromDate", formattedDate)
                                            }}
                                            className={errors.fromDate ? "border-red-500" : ""}
                                        />
                                        {errors.fromDate && <p className="text-sm text-red-600">{errors.fromDate}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="toDate">To Date & Time</Label>
                                        <Input
                                            id="toDate"
                                            type="datetime-local"
                                            value={params.toDate.slice(0, -8)}
                                            onChange={(e) => {
                                                const dateValue = e.target.value
                                                // Add seconds if not present
                                                const formattedDate =
                                                    dateValue.includes(":") && dateValue.split(":").length === 2
                                                        ? dateValue + ":00.000Z"
                                                        : dateValue + ".000Z"
                                                handleInputChange("toDate", formattedDate)
                                            }}
                                            className={errors.toDate ? "border-red-500" : ""}
                                        />
                                        {errors.toDate && <p className="text-sm text-red-600">{errors.toDate}</p>}
                                    </div>
                                </div>

                                {/* Stock Details */}
                                <div className="space-y-2">
                                    <Label htmlFor="stockCode">Stock Code</Label>
                                    <Input
                                        id="stockCode"
                                        value={params.stockCode}
                                        onChange={(e) => handleInputChange("stockCode", e.target.value)}
                                        placeholder="e.g., NIFTY, BANKNIFTY"
                                        className={errors.stockCode ? "border-red-500" : ""}
                                    />
                                    {errors.stockCode && <p className="text-sm text-red-600">{errors.stockCode}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="exchangeCode">Exchange Code</Label>
                                    <Select
                                        value={params.exchangeCode}
                                        onValueChange={(value) => handleInputChange("exchangeCode", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NFO">NFO (Derivatives)</SelectItem>
                                            <SelectItem value="NSE">NSE (Equity)</SelectItem>
                                            <SelectItem value="BSE">BSE (Equity)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="productType">Product Type</Label>
                                    <Select value={params.productType} onValueChange={(value) => handleInputChange("productType", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="options">Options</SelectItem>
                                            <SelectItem value="futures">Futures</SelectItem>
                                            <SelectItem value="equity">Equity</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Options Specific Fields */}
                                {params.productType === "options" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="expiryDate">Expiry Date</Label>
                                            <Input
                                                id="expiryDate"
                                                type="datetime-local"
                                                value={params.expiryDate.slice(0, -8)}
                                                onChange={(e) => {
                                                    const dateValue = e.target.value
                                                    // Add seconds if not present
                                                    const formattedDate =
                                                        dateValue.includes(":") && dateValue.split(":").length === 2
                                                            ? dateValue + ":00.000Z"
                                                            : dateValue + ".000Z"
                                                    handleInputChange("expiryDate", formattedDate)
                                                }}
                                                className={errors.expiryDate ? "border-red-500" : ""}
                                            />
                                            {errors.expiryDate && <p className="text-sm text-red-600">{errors.expiryDate}</p>}
                                        </div>

                                        {params.exchangeCode === 'NFO' && <div className="space-y-2">
                                            <Label htmlFor="right">Option Type</Label>
                                            <Select value={params.right} onValueChange={(value) => handleInputChange("right", value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="call">Call</SelectItem>
                                                    <SelectItem value="put">Put</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>}

                                        <div className="space-y-2">
                                            <Label htmlFor="strikePrice">Strike Price</Label>
                                            <Input
                                                id="strikePrice"
                                                type="number"
                                                value={params.strikePrice}
                                                onChange={(e) => handleInputChange("strikePrice", e.target.value)}
                                                placeholder="e.g., 23200"
                                                className={errors.strikePrice ? "border-red-500" : ""}
                                            />
                                            {errors.strikePrice && <p className="text-sm text-red-600">{errors.strikePrice}</p>}
                                        </div>
                                    </>
                                )}

                                <Button onClick={handleFetchData} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Fetching Data...
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-4 h-4 mr-2" />
                                            Fetch Historical Data
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-xl border-0">
                            <CardHeader>
                                <CardTitle>Historical Data Results</CardTitle>
                                <CardDescription>
                                    Market data for {params.stockCode} ({params.exchangeCode})
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {response && (
                                    <Alert
                                        className={`mb-6 ${response.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                                    >
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

                                {response?.success && response.data && response.data.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Summary */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <Badge variant="secondary">{response.data.length} Data Points</Badge>
                                            <Badge variant="outline">{params.interval} Interval</Badge>
                                            <Badge variant="outline">{params.productType.toUpperCase()}</Badge>
                                        </div>

                                        <Separator />

                                        {/* Data Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-2">DateTime</th>
                                                        <th className="text-right p-2">Open</th>
                                                        <th className="text-right p-2">High</th>
                                                        <th className="text-right p-2">Low</th>
                                                        <th className="text-right p-2">Close</th>
                                                        <th className="text-right p-2">Volume</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {response.data.map((point, index) => (
                                                        <tr key={index} className="border-b hover:bg-gray-50">
                                                            <td className="p-2 font-mono text-xs">{formatDateTime(point.datetime)}</td>
                                                            <td className="p-2 text-right font-mono">{formatCurrency(point.open)}</td>
                                                            <td className="p-2 text-right font-mono text-green-600">{formatCurrency(point.high)}</td>
                                                            <td className="p-2 text-right font-mono text-red-600">{formatCurrency(point.low)}</td>
                                                            <td className="p-2 text-right font-mono font-semibold">{formatCurrency(point.close)}</td>
                                                            <td className="p-2 text-right font-mono text-gray-600">
                                                                {point.volume.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    !isLoading && (
                                        <div className="text-center py-12 text-gray-500">
                                            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No data available. Configure parameters and fetch historical data.</p>
                                        </div>
                                    )
                                )}

                                {isLoading && (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
                                        <p className="text-gray-600">Fetching historical data...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
