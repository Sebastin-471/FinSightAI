import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, X, Clock } from "lucide-react";

export default function PerformanceMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-success" />
            Métricas de rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Cargando métricas...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="h-5 w-5 mr-2 text-success" />
          Métricas de rendimiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">
              {metrics.overallAccuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Precisión general
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-bullish mb-1 flex items-center justify-center">
              <Target className="h-5 w-5 mr-1" />
              {metrics.successfulPredictions}
            </div>
            <div className="text-sm text-muted-foreground">
              Predicciones exitosas
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-bearish mb-1 flex items-center justify-center">
              <X className="h-5 w-5 mr-1" />
              {metrics.failedPredictions}
            </div>
            <div className="text-sm text-muted-foreground">
              Predicciones fallidas
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning mb-1 flex items-center justify-center">
              <Clock className="h-5 w-5 mr-1" />
              24h
            </div>
            <div className="text-sm text-muted-foreground">
              Periodo activo
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
