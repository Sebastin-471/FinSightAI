import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "./useWebSocket";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export function useMarketData(assetId?: number) {
    const { lastMessage } = useWebSocket();

    const { data: latestData } = useQuery({
        queryKey: [`/api/assets/${assetId}/latest-data`],
        enabled: !!assetId,
        refetchInterval: 5000,
    });

    useEffect(() => {
        if (lastMessage && lastMessage.type === 'market-update' && assetId) {
            const assetUpdate = lastMessage.data.find((item: any) => item.asset.id === assetId);
            if (assetUpdate) {
                queryClient.setQueryData([`/api/assets/${assetId}/latest-data`], assetUpdate);
            }
        }
    }, [lastMessage, assetId]);

    return {
        marketData: latestData?.marketData,
        technicalIndicators: latestData?.technicalIndicators,
        prediction: latestData?.prediction,
    };
}
