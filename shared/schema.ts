import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stock', 'forex', 'crypto'
  exchange: text("exchange"),
  isActive: boolean("is_active").default(true),
});

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id),
  timestamp: timestamp("timestamp").notNull(),
  open: decimal("open", { precision: 10, scale: 4 }).notNull(),
  high: decimal("high", { precision: 10, scale: 4 }).notNull(),
  low: decimal("low", { precision: 10, scale: 4 }).notNull(),
  close: decimal("close", { precision: 10, scale: 4 }).notNull(),
  volume: integer("volume"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id),
  timestamp: timestamp("timestamp").notNull(),
  prediction: text("prediction").notNull(), // 'BUY', 'SELL'
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  entryPoint: decimal("entry_point", { precision: 10, scale: 4 }).notNull(),
  actualResult: text("actual_result"), // 'SUCCESS', 'FAILURE', null for pending
  technicalData: jsonb("technical_data"), // Store technical indicators
});

export const technicalIndicators = pgTable("technical_indicators", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id),
  timestamp: timestamp("timestamp").notNull(),
  sma20: decimal("sma_20", { precision: 10, scale: 4 }),
  ema12: decimal("ema_12", { precision: 10, scale: 4 }),
  rsi: decimal("rsi", { precision: 5, scale: 2 }),
  macd: decimal("macd", { precision: 10, scale: 4 }),
  bollingerUpper: decimal("bollinger_upper", { precision: 10, scale: 4 }),
  bollingerLower: decimal("bollinger_lower", { precision: 10, scale: 4 }),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
});

export const insertTechnicalIndicatorsSchema = createInsertSchema(technicalIndicators).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type MarketData = typeof marketData.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type TechnicalIndicators = typeof technicalIndicators.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type InsertTechnicalIndicators = z.infer<typeof insertTechnicalIndicatorsSchema>;
