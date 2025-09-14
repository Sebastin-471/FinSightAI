import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Brain } from "lucide-react";
import type { Prediction } from "@/types/market";

interface PredictionPanelProps {
    prediction?: Prediction;
}

export default function PredictionPanel({ prediction }: PredictionPanelProps) {
    if (!prediction) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Brain className="h-5 w-5 mr-2 text-neutral" />
                        Predicción de IA
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No hay predicciones disponibles</p>
                </CardContent>
            </Card>
        );
    }

    const isBullish = prediction.prediction === 'BUY';
    const confidence = parseFloat(prediction.confidence);
    const entryPoint = parseFloat(prediction.entryPoint);

    return (
        <Card className={`${isBullish ? 'prediction-glow' : 'bearish-glow'}`}>
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Brain className="h-5 w-5 mr-2 text-neutral" />
                    Predicción de IA
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div className={`text-4xl font-bold ${isBullish ? 'text-bullish' : 'text-bearish'} flex items-center justify-center`}>
                    {isBullish ? <TrendingUp className="h-8 w-8 mr-2" /> : <TrendingDown className="h-8 w-8 mr-2" />}
                    {prediction.prediction}
                </div>

                <div className={`text-2xl font-semibold ${isBullish ? 'text-bullish' : 'text-bearish'}`}>
                    {confidence.toFixed(1)}%
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                    Nivel de confianza
                </div>

                <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">
                        Punto de entrada sugerido
                    </div>
                    <div className={`text-lg font-semibold ${isBullish ? 'text-bullish' : 'text-bearish'}`}>
                        ${entryPoint.toFixed(2)}
                    </div>
                </div>

                <div className="flex justify-center space-x-2">
                    <Badge variant={confidence > 75 ? "default" : confidence > 60 ? "secondary" : "outline"}>
                        {confidence > 75 ? "Alta confianza" : confidence > 60 ? "Confianza media" : "Confianza baja"}
                    </Badge>
                    {prediction.actualResult && (
                        <Badge variant={prediction.actualResult === 'SUCCESS' ? "default" : "destructive"}>
                            {prediction.actualResult}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}