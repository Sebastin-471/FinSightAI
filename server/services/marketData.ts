import { storage } from '../storage';
import type { Asset, InsertMarketData } from '@shared/schema';

interface YahooFinanceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

interface ForexData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export class MarketDataService {
  private yahooFinanceApiKey: string;
  private alphaVantageApiKey: string;

  constructor() {
    this.yahooFinanceApiKey = process.env.YAHOO_FINANCE_API_KEY || process.env.FINANCIAL_API_KEY || '';
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.FINANCIAL_API_KEY || '';
  }

  async fetchRealTimeData(symbol: string, type: string): Promise<any> {
    try {
      switch (type) {
        case 'stock':
          return await this.fetchStockData(symbol);
        case 'forex':
          return await this.fetchForexData(symbol);
        case 'crypto':
          return await this.fetchCryptoData(symbol);
        default:
          throw new Error(`Unsupported asset type: ${type}`);
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      // Return mock data for development
      return this.generateMockData(symbol, type);
    }
  }

  private async fetchStockData(symbol: string): Promise<YahooFinanceData> {
    if (!this.yahooFinanceApiKey) {
      return this.generateMockData(symbol, 'stock');
    }

    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      headers: {
        'X-API-Key': this.yahooFinanceApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];

    return {
      symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: quote.volume[quote.volume.length - 1],
      timestamp: Date.now(),
    };
  }

  private async fetchForexData(symbol: string): Promise<ForexData> {
    if (!this.alphaVantageApiKey) {
      return this.generateMockData(symbol, 'forex');
    }

    const fromCurrency = symbol.slice(0, 3);
    const toCurrency = symbol.slice(3, 6);
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${this.alphaVantageApiKey}`
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();
    const exchangeRate = data['Realtime Currency Exchange Rate'];

    return {
      symbol,
      price: parseFloat(exchangeRate['5. Exchange Rate']),
      change: 0, // Calculate based on previous data
      changePercent: 0,
      timestamp: Date.now(),
    };
  }

  private async fetchCryptoData(symbol: string): Promise<any> {
    // Map symbol to CoinGecko ID
    const symbolMap: { [key: string]: string } = {
      'BTCUSD': 'bitcoin',
      'ETHUSD': 'ethereum',
      'ADAUSD': 'cardano',
      'DOTUSD': 'polkadot',
    };
    
    const coinId = symbolMap[symbol] || symbol.replace('USD', '').toLowerCase();
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    const coinData = data[coinId];

    if (!coinData) {
      throw new Error(`No data found for ${symbol}`);
    }

    return {
      symbol,
      price: coinData.usd || 0,
      change: coinData.usd_24h_change || 0,
      changePercent: coinData.usd_24h_change || 0,
      volume: coinData.usd_24h_vol || 0,
      timestamp: Date.now(),
    };
  }

  private generateMockData(symbol: string, type: string): any {
    const basePrice = this.getBasePriceForSymbol(symbol);
    const volatility = 0.02; // 2% volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const currentPrice = basePrice * (1 + randomChange);

    return {
      symbol,
      price: currentPrice,
      change: currentPrice - basePrice,
      changePercent: randomChange * 100,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      timestamp: Date.now(),
    };
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'AAPL': 175.25,
      'TSLA': 248.50,
      'GOOGL': 140.75,
      'MSFT': 378.85,
      'EURUSD': 1.0875,
      'BTCUSD': 43250.00,
    };

    return basePrices[symbol] || 100;
  }

  async updateMarketData(asset: Asset): Promise<void> {
    try {
      const data = await this.fetchRealTimeData(asset.symbol, asset.type);
      
      const marketData: InsertMarketData = {
        assetId: asset.id,
        timestamp: new Date(data.timestamp),
        open: data.price.toString(),
        high: data.price.toString(),
        low: data.price.toString(),
        close: data.price.toString(),
        volume: data.volume || 0,
      };

      await storage.createMarketData(marketData);
    } catch (error) {
      console.error(`Error updating market data for ${asset.symbol}:`, error);
    }
  }

  async startRealTimeUpdates(): Promise<void> {
    const assets = await storage.getAllAssets();
    
    // Update market data every 5 seconds
    setInterval(async () => {
      for (const asset of assets) {
        await this.updateMarketData(asset);
      }
    }, 5000);
  }
}

export const marketDataService = new MarketDataService();
