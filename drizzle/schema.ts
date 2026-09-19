import { double, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin", "operator", "approver", "field_officer", "viewer"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const alertDrafts = mysqlTable("alertDrafts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  severity: mysqlEnum("severity", ["YELLOW", "ORANGE", "RED"]).notNull(),
  affectedVillages: text("affectedVillages").notNull(),
  validityFrom: timestamp("validityFrom").notNull(),
  validityUntil: timestamp("validityUntil").notNull(),
  expectedImpactAt: timestamp("expectedImpactAt"),
  cascadeExplanation: text("cascadeExplanation").notNull(),
  recommendedAction: text("recommendedAction").notNull(),
  routeShelterDetails: text("routeShelterDetails").notNull(),
  confidence: int("confidence").notNull(),
  englishMessage: text("englishMessage").notNull(),
  hindiMessage: text("hindiMessage").notNull(),
  localMessage: text("localMessage"),
  status: mysqlEnum("status", ["DRAFT", "ACKNOWLEDGED", "APPROVED", "ISSUED", "CANCELLED", "EXPIRED"]).default("DRAFT").notNull(),
  createdBy: int("createdBy").notNull(),
  acknowledgedBy: int("acknowledgedBy"),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const fieldReports = mysqlTable("fieldReports", {
  id: int("id").autoincrement().primaryKey(),
  reportType: varchar("reportType", { length: 80 }).notNull(),
  latitude: varchar("latitude", { length: 32 }),
  longitude: varchar("longitude", { length: 32 }),
  locationLabel: varchar("locationLabel", { length: 255 }).notNull(),
  observedAt: timestamp("observedAt").notNull(),
  severity: mysqlEnum("severity", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).notNull(),
  description: text("description").notNull(),
  waterDepth: varchar("waterDepth", { length: 80 }),
  roadBridgeStatus: varchar("roadBridgeStatus", { length: 120 }),
  sensorCondition: varchar("sensorCondition", { length: 120 }),
  photoUrl: text("photoUrl"),
  status: mysqlEnum("status", ["NEW", "TRIAGED", "VERIFIED", "REJECTED"]).default("NEW").notNull(),
  submittedBy: int("submittedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: int("entityId").notNull(),
  action: varchar("action", { length: 80 }).notNull(),
  actorId: int("actorId").notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AlertDraft = typeof alertDrafts.$inferSelect;
export type FieldReport = typeof fieldReports.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;


export const commandTasks = mysqlTable("commandTasks", {
  id: int("id").autoincrement().primaryKey(),
  taskKey: varchar("taskKey", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", ["PENDING", "COMPLETED"]).default("PENDING").notNull(),
  completedBy: int("completedBy"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommandTask = typeof commandTasks.$inferSelect;


export const operationalResources = mysqlTable("operationalResources", {
  id: int("id").autoincrement().primaryKey(),
  resourceKey: varchar("resourceKey", { length: 32 }).notNull().unique(),
  resourceType: mysqlEnum("resourceType", ["ROUTE", "SHELTER"]).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  owner: varchar("owner", { length: 120 }).notNull(),
  assignedUserId: int("assignedUserId"),
  note: text("note"),
  updatedBy: int("updatedBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OperationalResource = typeof operationalResources.$inferSelect;

export const sensorReadings = mysqlTable("sensorReadings", {
  id: int("id").autoincrement().primaryKey(),
  sensorKey: varchar("sensorKey", { length: 64 }).notNull(),
  metric: varchar("metric", { length: 64 }).notNull(),
  value: double("value").notNull(),
  unit: varchar("unit", { length: 24 }).notNull(),
  observedAt: timestamp("observedAt").notNull(),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  quality: mysqlEnum("quality", ["GOOD", "STALE", "INVALID"]).default("GOOD").notNull(),
  metadata: text("metadata"),
});

export type SensorReading = typeof sensorReadings.$inferSelect;

export const floodPredictions = mysqlTable("floodPredictions", {
  id: int("id").autoincrement().primaryKey(),
  locationKey: varchar("locationKey", { length: 64 }).notNull(),
  state: mysqlEnum("state", ["GREEN", "YELLOW", "ORANGE", "RED"]).notNull(),
  probability: double("probability").notNull(),
  confidence: double("confidence").notNull(),
  leadTimeMinutes: int("leadTimeMinutes").notNull(),
  modelVersion: varchar("modelVersion", { length: 32 }).notNull(),
  evidence: text("evidence").notNull(),
  limitations: text("limitations").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type FloodPrediction = typeof floodPredictions.$inferSelect;

export const floodEvents = mysqlTable("floodEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventKey: varchar("eventKey", { length: 64 }).notNull().unique(),
  locationKey: varchar("locationKey", { length: 64 }).notNull(),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt"),
  severity: mysqlEnum("severity", ["WATCH", "WARNING", "FLASH_FLOOD", "DEBRIS_FLOW"]).notNull(),
  verified: int("verified").notNull().default(0),
  verificationSource: varchar("verificationSource", { length: 255 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FloodEvent = typeof floodEvents.$inferSelect;

export const alertDecisions = mysqlTable("alertDecisions", {
  id: int("id").autoincrement().primaryKey(),
  locationKey: varchar("locationKey", { length: 64 }).notNull(),
  level: mysqlEnum("level", ["GREEN", "YELLOW", "ORANGE", "RED"]).notNull(),
  probability: double("probability").notNull(),
  confidence: double("confidence").notNull(),
  leadTimeMinutes: int("leadTimeMinutes").notNull(),
  reason: text("reason").notNull(),
  limitations: text("limitations").notNull(),
  recommendedActions: text("recommendedActions").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertDecision = typeof alertDecisions.$inferSelect;
