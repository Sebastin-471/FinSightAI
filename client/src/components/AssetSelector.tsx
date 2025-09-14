import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers } from "lucide-react";
import type { Asset } from "@/types/market";

interface AssetSelectorProps {
    assets: Asset[];
    selectedAsset?: Asset | null;
    onAssetSelect: (asset: Asset) => void;
}

export default function AssetSelector({ assets, selectedAsset, onAssetSelect }: AssetSelectorProps) {
    const stockAssets = assets.filter(asset => asset.type === 'stock');
    const forexAssets = assets.filter(asset => asset.type === 'forex');
    const cryptoAssets = assets.filter(asset => asset.type === 'crypto');

    const handleAssetChange = (assetId: string) => {
        const asset = assets.find(a => a.id === parseInt(assetId));
        if (asset) {
            onAssetSelect(asset);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Layers className="h-5 w-5 mr-2 text-neutral" />
                    Selección de activos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Tipo de activo
                    </label>
                    <Select defaultValue="stocks">
                        <SelectTrigger>
                            <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="stocks">Stocks</SelectItem>
                            <SelectItem value="forex">FOREX</SelectItem>
                            <SelectItem value="crypto">Cryptocurrencies</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Activo específico
                    </label>
                    <Select value={selectedAsset?.id.toString() || ""} onValueChange={handleAssetChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                            {stockAssets.length > 0 && (
                                <>
                                    <SelectItem value="header-stocks" disabled>
                                        <span className="font-semibold text-muted-foreground">Stocks</span>
                                    </SelectItem>
                                    {stockAssets.map(asset => (
                                        <SelectItem key={asset.id} value={asset.id.toString()}>
                                            {asset.name} ({asset.symbol})
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                            {forexAssets.length > 0 && (
                                <>
                                    <SelectItem value="header-forex" disabled>
                                        <span className="font-semibold text-muted-foreground">FOREX</span>
                                    </SelectItem>
                                    {forexAssets.map(asset => (
                                        <SelectItem key={asset.id} value={asset.id.toString()}>
                                            {asset.name} ({asset.symbol})
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                            {cryptoAssets.length > 0 && (
                                <>
                                    <SelectItem value="header-crypto" disabled>
                                        <span className="font-semibold text-muted-foreground">Cryptocurrencies</span>
                                    </SelectItem>
                                    {cryptoAssets.map(asset => (
                                        <SelectItem key={asset.id} value={asset.id.toString()}>
                                            {asset.name} ({asset.symbol})
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Periodo de tiempo
                    </label>
                    <Select defaultValue="1m">
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar período de tiempo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1m">1 minuto</SelectItem>
                            <SelectItem value="5m">5 minutos</SelectItem>
                            <SelectItem value="15m">15 minutos</SelectItem>
                            <SelectItem value="1h">1 hora</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
