import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ChartProps {
    assetId?: number;
}

export default function Chart({ assetId }: ChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    const { data: marketData, isLoading } = useQuery({
        queryKey: [`/api/assets/${assetId}/market-data`, { limit: 50 }],
        enabled: !!assetId,
    });

    useEffect(() => {
        if (!marketData || !canvasRef.current) return;

        const loadChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            const ctx = canvasRef.current!.getContext('2d')!;

            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const prices = marketData.map((item: any) => parseFloat(item.close));
            const timestamps = marketData.map((item: any) =>
                new Date(item.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            );

            const sma20 = calculateSMA(prices, 20);
            const ema12 = calculateEMA(prices, 12);

            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timestamps.reverse(),
                    datasets: [
                        {
                            label: 'Price',
                            data: prices.reverse(),
                            borderColor: '#00d08a',
                            backgroundColor: 'rgba(0, 208, 138, 0.05)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 2,
                            pointBackgroundColor: 'hsl(var(--bullish))',
                        },
                        {
                            label: 'SMA (20)',
                            data: sma20.reverse().map(v => v ?? null),
                            borderColor: '#2463eb',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointRadius: 0,
                            fill: false,
                            pointBackgroundColor: 'hsl(var(--bullish))',
                        },
                        {
                            label: 'EMA (12)',
                            data: ema12.reverse(),
                            borderColor: '#f8c630',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointRadius: 0,
                            fill: false,
                            pointBackgroundColor: 'hsl(var(--bullish))',
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: 'white',
                                usePointStyle: true,
                            },
                        },
                        tooltip: {
                            backgroundColor: 'hsl(var(--card))',
                            titleColor: 'white',
                            bodyColor: 'hsl(var(--foreground))',
                            borderColor: 'hsl(var(--border))',
                            borderWidth: 1,
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'hsl(var(--border))',
                            },
                            ticks: {
                                color: 'white',
                            },
                        },
                        y: {
                            grid: {
                                color: 'hsl(var(--border))',
                            },
                            ticks: {
                                color: 'white',
                                callback: function (value: any) {
                                    return '$' + value.toFixed(2);
                                },
                            },
                        },
                    },
                    layout: {
                        padding: {
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10,
                        },
                    },
                },
            });

        };

        loadChart();

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [marketData]);

    const calculateSMA = (prices: number[], period: number): number[] => {
        const sma = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                sma.push(null);
            } else {
                const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                sma.push(sum / period);
            }
        }
        return sma;
    };

    const calculateEMA = (prices: number[], period: number): number[] => {
        const ema = [];
        const k = 2 / (period + 1);

        for (let i = 0; i < prices.length; i++) {
            if (i === 0) {
                ema.push(prices[i]);
            } else {
                ema.push((prices[i] * k) + (ema[i - 1] * (1 - k)));
            }
        }
        return ema;
    };

    if (isLoading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="h-[400px] bg-card rounded-lg p-4 relative">
                <canvas ref={canvasRef} className="w-full h-full" />

                <div className="absolute left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border" style={{ top: ' -0.25rem' }}>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-bullish rounded mr-2 bg-success2"></div>
                            <span>Price</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-neutral rounded mr-2" style={{ backgroundColor: '#2463eb' }}></div>
                            <span>SMA (20)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-warning rounded mr-2" style={{ backgroundColor: '#f8c630' }}></div>
                            <span>EMA (12)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
