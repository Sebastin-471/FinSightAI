import { storage } from '../storage';
import { technicalAnalysisService } from './technicalAnalysis';
import type { Asset, MarketData, TechnicalIndicators, InsertPrediction } from '@shared/schema';

export class PredictionService {
  private predictionHistory: Map<number, boolean[]> = new Map();

  async generatePrediction(asset: Asset): Promise<void> {
    try {
      const marketData = await storage.getMarketDataHistory(asset.id, 10);
      const technicalIndicators = await storage.getLatestTechnicalIndicators(asset.id);
      
      if (!marketData.length || !technicalIndicators) {
        return;
      }

      const patterns = technicalAnalysisService.detectCandlestickPatterns(marketData);
      const prediction = this.analyzeTechnicalData(marketData, technicalIndicators, patterns);

      const insertPrediction: InsertPrediction = {
        assetId: asset.id,
        timestamp: new Date(),
        prediction: prediction.direction,
        confidence: prediction.confidence.toString(),
        entryPoint: prediction.entryPoint.toString(),
        actualResult: null,
        technicalData: {
          patterns,
          rsi: technicalIndicators.rsi,
          macd: technicalIndicators.macd,
          sma20: technicalIndicators.sma20,
          ema12: technicalIndicators.ema12,
        },
      };

      await storage.createPrediction(insertPrediction);
    } catch (error) {
      console.error(`Error generating prediction for ${asset.symbol}:`, error);
    }
  }

  private analyzeTechnicalData(
    marketData: MarketData[],
    indicators: TechnicalIndicators,
    patterns: string[]
  ): { direction: string; confidence: number; entryPoint: number } {
    const currentPrice = parseFloat(marketData[0].close);
    const rsi = parseFloat(indicators.rsi || '50');
    const macd = parseFloat(indicators.macd || '0');
    const sma20 = parseFloat(indicators.sma20 || currentPrice.toString());
    const ema12 = parseFloat(indicators.ema12 || currentPrice.toString());

    let bullishSignals = 0;
    let bearishSignals = 0;
    let totalSignals = 0;

    // RSI Analysis
    totalSignals++;
    if (rsi < 30) {
      bullishSignals++; // Oversold
    } else if (rsi > 70) {
      bearishSignals++; // Overbought
    }

    // MACD Analysis
    totalSignals++;
    if (macd > 0) {
      bullishSignals++;
    } else {
      bearishSignals++;
    }

    // Moving Average Analysis
    totalSignals++;
    if (currentPrice > sma20) {
      bullishSignals++;
    } else {
      bearishSignals++;
    }

    totalSignals++;
    if (currentPrice > ema12) {
      bullishSignals++;
    } else {
      bearishSignals++;
    }

    // Pattern Analysis
    patterns.forEach(pattern => {
      totalSignals++;
      if (pattern.includes('Bullish') || pattern.includes('Hammer')) {
        bullishSignals++;
      } else if (pattern.includes('Bearish') || pattern.includes('Shooting Star')) {
        bearishSignals++;
      }
    });

    // Price momentum
    totalSignals++;
    if (marketData.length >= 2) {
      const prevPrice = parseFloat(marketData[1].close);
      if (currentPrice > prevPrice) {
        bullishSignals++;
      } else {
        bearishSignals++;
      }
    }

    // Determine direction and confidence
    const direction = bullishSignals > bearishSignals ? 'BUY' : 'SELL';
    const strongerSignals = Math.max(bullishSignals, bearishSignals);
    const confidence = Math.min(95, Math.max(55, (strongerSignals / totalSignals) * 100));

    // Calculate entry point
    const entryPoint = direction === 'BUY' 
      ? currentPrice * 1.001 // Slightly above current price for buy
      : currentPrice * 0.999; // Slightly below current price for sell

    return {
      direction,
      confidence: Math.round(confidence * 10) / 10,
      entryPoint: Math.round(entryPoint * 100) / 100,
    };
  }

  async validatePredictions(): Promise<void> {
    const recentPredictions = await storage.getRecentPredictions(100);
    
    for (const prediction of recentPredictions) {
      if (prediction.actualResult !== null) continue;
      
      const predictionTime = new Date(prediction.timestamp);
      const currentTime = new Date();
      const timeDiff = currentTime.getTime() - predictionTime.getTime();
      
      // Validate predictions after 1 minute
      if (timeDiff >= 60000) {
        const currentMarketData = await storage.getLatestMarketData(prediction.assetId!);
        if (currentMarketData) {
          const currentPrice = parseFloat(currentMarketData.close);
          const entryPoint = parseFloat(prediction.entryPoint);
          
          let result = 'FAILURE';
          if (prediction.prediction === 'BUY' && currentPrice > entryPoint) {
            result = 'SUCCESS';
          } else if (prediction.prediction === 'SELL' && currentPrice < entryPoint) {
            result = 'SUCCESS';
          }
          
          await storage.updatePredictionResult(prediction.id, result);
          
          // Update prediction history for accuracy tracking
          const assetHistory = this.predictionHistory.get(prediction.assetId!) || [];
          assetHistory.push(result === 'SUCCESS');
          this.predictionHistory.set(prediction.assetId!, assetHistory.slice(-100)); // Keep last 100 predictions
        }
      }
    }
  }

  async getAccuracyMetrics(): Promise<{
    overallAccuracy: number;
    successfulPredictions: number;
    failedPredictions: number;
    totalPredictions: number;
  }> {
    const allPredictions = await storage.getRecentPredictions(1000);
    const completedPredictions = allPredictions.filter(p => p.actualResult !== null);
    
    const successfulPredictions = completedPredictions.filter(p => p.actualResult === 'SUCCESS').length;
    const failedPredictions = completedPredictions.filter(p => p.actualResult === 'FAILURE').length;
    const totalPredictions = completedPredictions.length;
    
    const overallAccuracy = totalPredictions > 0 ? (successfulPredictions / totalPredictions) * 100 : 0;
    
    return {
      overallAccuracy: Math.round(overallAccuracy * 10) / 10,
      successfulPredictions,
      failedPredictions,
      totalPredictions,
    };
  }

  async startPredictionEngine(): Promise<void> {
    const assets = await storage.getAllAssets();
    
    // Generate predictions every 60 seconds
    setInterval(async () => {
      for (const asset of assets) {
        await this.generatePrediction(asset);
      }
    }, 60000);
    
    // Validate predictions every 30 seconds
    setInterval(async () => {
      await this.validatePredictions();
    }, 30000);
  }
}

export const predictionService = new PredictionService();
