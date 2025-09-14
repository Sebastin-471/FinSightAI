import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { marketDataService } from "./services/marketData";
import { technicalAnalysisService } from "./services/technicalAnalysis";
import { predictionService } from "./services/prediction";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getAllAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/:id/market-data", async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      const marketData = await storage.getMarketDataHistory(assetId, limit);
      res.json(marketData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/assets/:id/latest-data", async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const marketData = await storage.getLatestMarketData(assetId);
      const technicalIndicators = await storage.getLatestTechnicalIndicators(assetId);
      const prediction = await storage.getLatestPrediction(assetId);
      
      res.json({
        marketData,
        technicalIndicators,
        prediction,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest data" });
    }
  });

  app.get("/api/predictions/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const predictions = await storage.getRecentPredictions(limit);
      
      // Enrich predictions with asset information
      const enrichedPredictions = await Promise.all(
        predictions.map(async (prediction) => {
          const asset = await storage.getAsset(prediction.assetId!);
          return {
            ...prediction,
            asset,
          };
        })
      );
      
      res.json(enrichedPredictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch predictions" });
    }
  });

  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await predictionService.getAccuracyMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'subscribe') {
          // Handle subscription to specific assets
          console.log(`Client subscribed to: ${data.assets}`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast real-time updates to connected clients
  const broadcastUpdate = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Start services
  await marketDataService.startRealTimeUpdates();
  await technicalAnalysisService.startTechnicalAnalysis();
  await predictionService.startPredictionEngine();

  // Broadcast updates every 5 seconds
  setInterval(async () => {
    try {
      const assets = await storage.getAllAssets();
      const updates = await Promise.all(
        assets.map(async (asset) => {
          const marketData = await storage.getLatestMarketData(asset.id);
          const technicalIndicators = await storage.getLatestTechnicalIndicators(asset.id);
          const prediction = await storage.getLatestPrediction(asset.id);
          
          return {
            asset,
            marketData,
            technicalIndicators,
            prediction,
          };
        })
      );
      
      broadcastUpdate({
        type: 'market-update',
        data: updates,
      });
    } catch (error) {
      console.error('Error broadcasting updates:', error);
    }
  }, 5000);

  return httpServer;
}
