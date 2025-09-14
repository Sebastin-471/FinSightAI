import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from "lucide-react";

export default function RecentPredictions() {
    const { data: predictions } = useQuery({
        queryKey: ["/api/predictions/recent", { limit: 10 }],
    });

    if (!predictions || predictions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <History className="h-5 w-5 mr-2 text-neutral" />
                        Predicciones recientes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        No hay predicciones disponibles
                    </p>
                </CardContent>
            </Card>
        );
    }

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getResultBadge = (result: string | null) => {
        if (!result) {
            return (
                <Badge variant="outline" className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                </Badge>
            );
        }

        if (result === 'SUCCESS') {
            return (
                <Badge variant="default" className="bg-success2 hover:bg-success/90 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Éxito
                </Badge>
            );
        }

        return (
            <Badge variant="destructive" className="flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                Fallido
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <History className="h-5 w-5 mr-2 text-neutral" />
                    Predicciones recientes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tiempo</TableHead>
                            <TableHead>Activo</TableHead>
                            <TableHead>Predicción</TableHead>
                            <TableHead>Confianza</TableHead>
                            <TableHead>Punto de entrada</TableHead>
                            <TableHead>Resultado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {predictions.map((prediction: any) => (
                            <TableRow key={prediction.id}>
                                <TableCell className="font-mono text-sm">
                                    {formatTime(prediction.timestamp)}
                                </TableCell>
                                <TableCell className="font-semibold">
                                    {prediction.asset?.symbol || 'Unknown'}
                                </TableCell>
                                <TableCell>
                                    <div className={`flex items-center ${prediction.prediction === 'BUY' ? 'text-bullish' : 'text-bearish'}`}>
                                        {prediction.prediction === 'BUY' ? (
                                            <TrendingUp className="h-4 w-4 mr-1" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 mr-1" />
                                        )}
                                        {prediction.prediction}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {parseFloat(prediction.confidence).toFixed(1)}%
                                </TableCell>
                                <TableCell>
                                    ${parseFloat(prediction.entryPoint).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {getResultBadge(prediction.actualResult)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
