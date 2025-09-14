import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Activity, Brain, Clock, Target } from "lucide-react";
import Chart from "@/components/Chart";
import PredictionPanel from "@/components/PredictionPanel";
import AssetSelector from "@/components/AssetSelector";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import MarketTicker from "@/components/MarketTicker";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import RecentPredictions from "@/components/RecentPredictions";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMarketData } from "@/hooks/useMarketData";
import type { Asset } from "@/types/market";

export default function Dashboard() {
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const { data: assets } = useQuery({
        queryKey: ["/api/assets"],
    });

    const { marketData, technicalIndicators, prediction } = useMarketData(selectedAsset?.id);
    const { isConnected } = useWebSocket();

    useEffect(() => {
        if (assets && assets.length > 0 && !selectedAsset) {
            setSelectedAsset(assets[0]);
        }
    }, [assets, selectedAsset]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            timeZone: 'America/New_York'
        }) + ' EST';
    };

    const currentPrice = marketData?.close ? parseFloat(marketData.close) : 0;
    const previousPrice = 175.25;
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="h-8 w-8 text-bullish" />
                            <h1 className="text-2xl font-bold">FinSightAI</h1>
                            <Badge variant="secondary" className="bg-bullish text-white">
                                LIVE
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(currentTime)}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success2 pulse-animation' : 'bg-destructive'}`} />
                                <span className={`text-sm ${isConnected ? 'text-success' : 'text-destructive'}`}>
                                    {isConnected ? 'Market Open' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Market Ticker */}
            <MarketTicker />

            {/* Main Dashboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <AssetSelector
                            assets={assets || []}
                            selectedAsset={selectedAsset}
                            onAssetSelect={setSelectedAsset}
                        />

                        {/* Current Price Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Target className="h-5 w-5 mr-2 text-warning" />
                                    Precio actual
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Precio</span>
                                    <span className="text-2xl font-bold text-bullish">
                                        ${currentPrice.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Cambio</span>
                                    <span className={`flex items-center ${change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                                        {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                                        ${Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Volumen</span>
                                    <span className="text-foreground">{marketData?.volume?.toLocaleString() || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <TechnicalIndicators indicators={technicalIndicators} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Chart */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center text-lg">
                                        <Activity className="h-5 w-5 mr-2 text-bullish" />
                                        {selectedAsset?.symbol || 'Select Asset'} - {selectedAsset?.name || ''}
                                    </CardTitle>
                                    <div className="flex space-x-2">
                                        <Badge variant="outline">1m</Badge>
                                        <Badge variant="outline">Real-time</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Chart assetId={selectedAsset?.id} />
                            </CardContent>
                        </Card>

                        {/* Prediction Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PredictionPanel prediction={prediction} />

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Brain className="h-5 w-5 mr-2 text-neutral" />
                                        Análisis de patrones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Patrón detectado</span>
                                        <span className="text-bullish font-semibold">Bullish Hammer</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Fortaleza</span>
                                        <div className="flex items-center">
                                            <div className="w-16 h-2 bg-muted rounded-full mr-2">
                                                <div className="w-3/4 h-2 bg-bullish rounded-full"></div>
                                            </div>
                                            <span className="text-sm">Strong</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Nivel de soporte</span>
                                        <span className="text-foreground">$173.50</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Nivel de resistencia</span>
                                        <span className="text-foreground">$177.80</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <PerformanceMetrics />
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                <RecentPredictions />
            </div>

            {/* Footer */}
            <footer className="bg-card border-t border-border py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div>© 2024 TrendForecaster Pro. All rights reserved.</div>
                        <div className="flex items-center space-x-6">
                            <span>Risk Warning: Trading involves substantial risk</span>
                            <span>|</span>
                            <span>Data provided by multiple financial APIs</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
