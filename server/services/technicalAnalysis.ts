import { storage } from '../storage';
import type { Asset, MarketData, InsertTechnicalIndicators } from '@shared/schema';

export class TechnicalAnalysisService {
  async calculateIndicators(asset: Asset): Promise<void> {
    const marketData = await storage.getMarketDataHistory(asset.id, 50);
    
    if (marketData.length < 20) {
      return; // Not enough data for calculations
    }

    const prices = marketData.map(md => parseFloat(md.close));
    const volumes = marketData.map(md => md.volume || 0);

    const indicators: InsertTechnicalIndicators = {
      assetId: asset.id,
      timestamp: new Date(),
      sma20: this.calculateSMA(prices, 20).toString(),
      ema12: this.calculateEMA(prices, 12).toString(),
      rsi: this.calculateRSI(prices, 14).toString(),
      macd: this.calculateMACD(prices).toString(),
      bollingerUpper: this.calculateBollingerBands(prices, 20).upper.toString(),
      bollingerLower: this.calculateBollingerBands(prices, 20).lower.toString(),
    };

    await storage.createTechnicalIndicators(indicators);
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    
    const recentPrices = prices.slice(-period);
    const sum = recentPrices.reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    
    const k = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * k) + (ema * (1 - k));
    }
    
    return ema;
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((acc, gain) => acc + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((acc, loss) => acc + loss, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): number {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }

  private calculateBollingerBands(prices: number[], period: number): { upper: number; lower: number } {
    const sma = this.calculateSMA(prices, period);
    const recentPrices = prices.slice(-period);
    
    const variance = recentPrices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (2 * stdDev),
      lower: sma - (2 * stdDev),
    };
  }

  detectCandlestickPatterns(marketData: MarketData[]): string[] {
    const patterns: string[] = [];
    
    if (marketData.length < 3) return patterns;
    
    const current = marketData[0];
    const previous = marketData[1];
    const previous2 = marketData[2];
    
    // Hammer pattern
    if (this.isHammer(current)) {
      patterns.push('Bullish Hammer');
    }
    
    // Shooting star pattern
    if (this.isShootingStar(current)) {
      patterns.push('Shooting Star');
    }
    
    // Engulfing patterns
    if (this.isBullishEngulfing(previous, current)) {
      patterns.push('Bullish Engulfing');
    }
    
    if (this.isBearishEngulfing(previous, current)) {
      patterns.push('Bearish Engulfing');
    }
    
    return patterns;
  }

  private isHammer(candle: MarketData): boolean {
    const open = parseFloat(candle.open);
    const high = parseFloat(candle.high);
    const low = parseFloat(candle.low);
    const close = parseFloat(candle.close);
    
    const body = Math.abs(close - open);
    const lowerShadow = Math.min(open, close) - low;
    const upperShadow = high - Math.max(open, close);
    
    return lowerShadow > 2 * body && upperShadow < body;
  }

  private isShootingStar(candle: MarketData): boolean {
    const open = parseFloat(candle.open);
    const high = parseFloat(candle.high);
    const low = parseFloat(candle.low);
    const close = parseFloat(candle.close);
    
    const body = Math.abs(close - open);
    const lowerShadow = Math.min(open, close) - low;
    const upperShadow = high - Math.max(open, close);
    
    return upperShadow > 2 * body && lowerShadow < body;
  }

  private isBullishEngulfing(previous: MarketData, current: MarketData): boolean {
    const prevOpen = parseFloat(previous.open);
    const prevClose = parseFloat(previous.close);
    const currOpen = parseFloat(current.open);
    const currClose = parseFloat(current.close);
    
    return prevClose < prevOpen && // Previous candle was bearish
           currClose > currOpen && // Current candle is bullish
           currOpen < prevClose &&  // Current opens below previous close
           currClose > prevOpen;    // Current closes above previous open
  }

  private isBearishEngulfing(previous: MarketData, current: MarketData): boolean {
    const prevOpen = parseFloat(previous.open);
    const prevClose = parseFloat(previous.close);
    const currOpen = parseFloat(current.open);
    const currClose = parseFloat(current.close);
    
    return prevClose > prevOpen && // Previous candle was bullish
           currClose < currOpen && // Current candle is bearish
           currOpen > prevClose &&  // Current opens above previous close
           currClose < prevOpen;    // Current closes below previous open
  }

  async startTechnicalAnalysis(): Promise<void> {
    const assets = await storage.getAllAssets();
    
    // Calculate indicators every 30 seconds
    setInterval(async () => {
      for (const asset of assets) {
        await this.calculateIndicators(asset);
      }
    }, 30000);
  }
}

export const technicalAnalysisService = new TechnicalAnalysisService();
