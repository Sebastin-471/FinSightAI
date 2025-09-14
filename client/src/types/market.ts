export interface Asset {
    id: number;
    symbol: string;
    name: string;
    type: 'stock' | 'forex' | 'crypto';
    exchange?: string;
    isActive?: boolean;
}

export interface MarketData {
    id: number;
    assetId: number;
    timestamp: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: number;
}

export interface TechnicalIndicators {
    id: number;
    assetId: number;
    timestamp: string;
    sma20?: string;
    ema12?: string;
    rsi?: string;
    macd?: string;
    bollingerUpper?: string;
    bollingerLower?: string;
}

export interface Prediction {
    id: number;
    assetId: number;
    timestamp: string;
    prediction: 'BUY' | 'SELL';
    confidence: string;
    entryPoint: string;
    actualResult?: 'SUCCESS' | 'FAILURE' | null;
    technicalData?: any;
}

export interface PerformanceMetrics {
    overallAccuracy: number;
    successfulPredictions: number;
    failedPredictions: number;
    totalPredictions: number;
}
