import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import type { TechnicalIndicators } from "@/types/market";

interface TechnicalIndicatorsProps {
    indicators?: TechnicalIndicators;
}

export default function TechnicalIndicators({ indicators }: TechnicalIndicatorsProps) {
    if (!indicators) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <BarChart className="h-5 w-5 mr-2 text-neutral" />
                        Indicadores técnicos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        No hay indicadores disponibles
                    </p>
                </CardContent>
            </Card>
        );
    }

    const formatValue = (value: string | null, prefix = '', suffix = '') => {
        if (!value) return 'N/A';
        const num = parseFloat(value);
        return `${prefix}${num.toFixed(2)}${suffix}`;
    };

    const getRsiColor = (rsi: string | null) => {
        if (!rsi) return 'text-muted-foreground';
        const value = parseFloat(rsi);
        if (value > 70) return 'text-bearish';
        if (value < 30) return 'text-bullish';
        return 'text-warning';
    };

    const getMacdColor = (macd: string | null) => {
        if (!macd) return 'text-muted-foreground';
        const value = parseFloat(macd);
        return value > 0 ? 'text-bullish' : 'text-bearish';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <BarChart className="h-5 w-5 mr-2 text-neutral" />
                    Indicadores técnicos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">RSI (14)</span>
                    <span className={getRsiColor(indicators.rsi)}>
                        {formatValue(indicators.rsi)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">MACD</span>
                    <span className={getMacdColor(indicators.macd)}>
                        {formatValue(indicators.macd)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">SMA (20)</span>
                    <span className="text-foreground">
                        {formatValue(indicators.sma20, '$')}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">EMA (12)</span>
                    <span className="text-foreground">
                        {formatValue(indicators.ema12, '$')}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bollinger Upper</span>
                    <span className="text-foreground">
                        {formatValue(indicators.bollingerUpper, '$')}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bollinger Lower</span>
                    <span className="text-foreground">
                        {formatValue(indicators.bollingerLower, '$')}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
