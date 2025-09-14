import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarketTicker() {
    const { data: assets } = useQuery({
        queryKey: ["/api/assets"],
    });

    if (!assets || assets.length === 0) {
        return null;
    }

    const tickerData = assets.slice(0, 4).map((asset: any) => ({
        symbol: asset.symbol,
        price: (Math.random() * 1000 + 100).toFixed(2),
        change: (Math.random() * 10 - 5).toFixed(2),
        changePercent: (Math.random() * 10 - 5).toFixed(2),
    }));

    return (
        <div className="bg-muted py-2 overflow-hidden">
            <div className="ticker-scroll whitespace-nowrap">
                {tickerData.map((item, index) => (
                    <span key={index} className="inline-flex items-center mx-8">
                        <span className="text-sm font-semibold">{item.symbol}</span>
                        <span className={`ml-2 ${parseFloat(item.change) >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                            ${item.price}
                        </span>
                        <span className={`ml-1 flex items-center ${parseFloat(item.change) >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                            {parseFloat(item.change) >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {item.changePercent}%
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}