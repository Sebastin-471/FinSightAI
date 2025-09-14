import { 
  users, assets, marketData, predictions, technicalIndicators,
  type User, type InsertUser, type Asset, type InsertAsset,
  type MarketData, type InsertMarketData, type Prediction, type InsertPrediction,
  type TechnicalIndicators, type InsertTechnicalIndicators
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Asset operations
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetBySymbol(symbol: string): Promise<Asset | undefined>;
  getAllAssets(): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  
  // Market data operations
  getLatestMarketData(assetId: number): Promise<MarketData | undefined>;
  getMarketDataHistory(assetId: number, limit: number): Promise<MarketData[]>;
  createMarketData(data: InsertMarketData): Promise<MarketData>;
  
  // Prediction operations
  getLatestPrediction(assetId: number): Promise<Prediction | undefined>;
  getRecentPredictions(limit: number): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePredictionResult(id: number, result: string): Promise<void>;
  
  // Technical indicators operations
  getLatestTechnicalIndicators(assetId: number): Promise<TechnicalIndicators | undefined>;
  createTechnicalIndicators(indicators: InsertTechnicalIndicators): Promise<TechnicalIndicators>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private assets: Map<number, Asset> = new Map();
  private marketData: Map<number, MarketData> = new Map();
  private predictions: Map<number, Prediction> = new Map();
  private technicalIndicators: Map<number, TechnicalIndicators> = new Map();
  
  private currentUserId = 1;
  private currentAssetId = 1;
  private currentMarketDataId = 1;
  private currentPredictionId = 1;
  private currentTechnicalIndicatorsId = 1;

  constructor() {
    // Initialize with sample assets
    this.initializeSampleAssets();
  }

  private initializeSampleAssets() {
    const sampleAssets: InsertAsset[] = [
      { symbol: 'AAPL', name: 'Apple Inc', type: 'stock', exchange: 'NASDAQ', isActive: true },
      { symbol: 'TSLA', name: 'Tesla Inc', type: 'stock', exchange: 'NASDAQ', isActive: true },
      { symbol: 'GOOGL', name: 'Alphabet Inc', type: 'stock', exchange: 'NASDAQ', isActive: true },
      { symbol: 'MSFT', name: 'Microsoft Corp', type: 'stock', exchange: 'NASDAQ', isActive: true },
      { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', exchange: 'FOREX', isActive: true },
      { symbol: 'BTCUSD', name: 'Bitcoin/USD', type: 'crypto', exchange: 'CRYPTO', isActive: true },
    ];

    sampleAssets.forEach(asset => {
      this.createAsset(asset);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Asset operations
  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async getAssetBySymbol(symbol: string): Promise<Asset | undefined> {
    return Array.from(this.assets.values()).find(asset => asset.symbol === symbol);
  }

  async getAllAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(asset => asset.isActive);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.currentAssetId++;
    const asset: Asset = { 
      id,
      symbol: insertAsset.symbol,
      name: insertAsset.name,
      type: insertAsset.type,
      exchange: insertAsset.exchange || null,
      isActive: insertAsset.isActive ?? null
    };
    this.assets.set(id, asset);
    return asset;
  }

  // Market data operations
  async getLatestMarketData(assetId: number): Promise<MarketData | undefined> {
    const data = Array.from(this.marketData.values())
      .filter(md => md.assetId === assetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return data[0];
  }

  async getMarketDataHistory(assetId: number, limit: number): Promise<MarketData[]> {
    return Array.from(this.marketData.values())
      .filter(md => md.assetId === assetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createMarketData(insertData: InsertMarketData): Promise<MarketData> {
    const id = this.currentMarketDataId++;
    const data: MarketData = { 
      id,
      assetId: insertData.assetId || null,
      timestamp: insertData.timestamp,
      open: insertData.open,
      high: insertData.high,
      low: insertData.low,
      close: insertData.close,
      volume: insertData.volume || null
    };
    this.marketData.set(id, data);
    return data;
  }

  // Prediction operations
  async getLatestPrediction(assetId: number): Promise<Prediction | undefined> {
    const predictions = Array.from(this.predictions.values())
      .filter(p => p.assetId === assetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return predictions[0];
  }

  async getRecentPredictions(limit: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const prediction: Prediction = { 
      id,
      assetId: insertPrediction.assetId || null,
      timestamp: insertPrediction.timestamp,
      prediction: insertPrediction.prediction,
      confidence: insertPrediction.confidence,
      entryPoint: insertPrediction.entryPoint,
      actualResult: insertPrediction.actualResult || null,
      technicalData: insertPrediction.technicalData || null
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async updatePredictionResult(id: number, result: string): Promise<void> {
    const prediction = this.predictions.get(id);
    if (prediction) {
      prediction.actualResult = result;
      this.predictions.set(id, prediction);
    }
  }

  // Technical indicators operations
  async getLatestTechnicalIndicators(assetId: number): Promise<TechnicalIndicators | undefined> {
    const indicators = Array.from(this.technicalIndicators.values())
      .filter(ti => ti.assetId === assetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return indicators[0];
  }

  async createTechnicalIndicators(insertIndicators: InsertTechnicalIndicators): Promise<TechnicalIndicators> {
    const id = this.currentTechnicalIndicatorsId++;
    const indicators: TechnicalIndicators = { 
      id,
      assetId: insertIndicators.assetId || null,
      timestamp: insertIndicators.timestamp,
      sma20: insertIndicators.sma20 || null,
      ema12: insertIndicators.ema12 || null,
      rsi: insertIndicators.rsi || null,
      macd: insertIndicators.macd || null,
      bollingerUpper: insertIndicators.bollingerUpper || null,
      bollingerLower: insertIndicators.bollingerLower || null
    };
    this.technicalIndicators.set(id, indicators);
    return indicators;
  }
}

export const storage = new MemStorage();
