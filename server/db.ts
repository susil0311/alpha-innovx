import { desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import { randomBytes, scryptSync } from "node:crypto";
import { alertDecisions, alertDrafts, auditEvents, commandTasks, fieldReports, floodEvents, floodPredictions, InsertUser, operationalResources, sensorReadings, User, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
const demoUsers = new Map<string, User>();
let nextDemoUserId = 10000;

export const DEMO_ACCOUNTS = [
  { name: "District Administrator", email: "admin@floodnexus.demo", password: "FloodNexus@Admin26", role: "admin" as const, label: "Administrator" },
  { name: "Control Room Operator", email: "operator@floodnexus.demo", password: "FloodNexus@Ops26", role: "operator" as const, label: "Control-room operator" },
  { name: "Alert Approver", email: "approver@floodnexus.demo", password: "FloodNexus@Approve26", role: "approver" as const, label: "Alert approver" },
  { name: "Field Officer", email: "field@floodnexus.demo", password: "FloodNexus@Field26", role: "field_officer" as const, label: "Field officer" },
  { name: "Situation Viewer", email: "viewer@floodnexus.demo", password: "FloodNexus@View26", role: "viewer" as const, label: "Read-only viewer" },
] as const;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.email && ENV.googleAdminEmails.includes(user.email.toLowerCase())) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return demoUsers.get(openId);
  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0] ?? demoUsers.get(openId);
  } catch (error) {
    console.warn("[Database] User lookup unavailable; using demo account store:", error instanceof Error ? error.message : error);
    return demoUsers.get(openId);
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  const normalizedEmail = email.toLowerCase();
  if (!db) return demoUsers.get(`email:${normalizedEmail}`);
  try {
    const result = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    return result[0] ?? demoUsers.get(`email:${normalizedEmail}`);
  } catch (error) {
    console.warn("[Database] Email lookup unavailable; using demo account store:", error instanceof Error ? error.message : error);
    return demoUsers.get(`email:${normalizedEmail}`);
  }
}

export async function createEmailUser(input: { email: string; name: string; passwordHash: string; role: NonNullable<InsertUser["role"]> }) {
  const db = await getDb();
  const email = input.email.toLowerCase();
  const openId = `email:${email}`;
  const now = new Date();
  if (!db) {
    const demoUser: User = { id: nextDemoUserId++, openId, name: input.name, email, loginMethod: "email", passwordHash: input.passwordHash, role: input.role, createdAt: now, updatedAt: now, lastSignedIn: now };
    demoUsers.set(openId, demoUser);
    return demoUser;
  }
  try {
    await db.insert(users).values({ openId, email, name: input.name, passwordHash: input.passwordHash, loginMethod: "email", role: input.role, lastSignedIn: now });
    return db.select().from(users).where(eq(users.openId, openId)).limit(1).then(rows => rows[0]);
  } catch (error) {
    console.warn("[Database] Account persistence unavailable; using demo account store:", error instanceof Error ? error.message : error);
    const demoUser: User = { id: nextDemoUserId++, openId, name: input.name, email, loginMethod: "email", passwordHash: input.passwordHash, role: input.role, createdAt: now, updatedAt: now, lastSignedIn: now };
    demoUsers.set(openId, demoUser);
    return demoUser;
  }
}


function demoHashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export async function ensureDemoAccounts() {
  for (const account of DEMO_ACCOUNTS) {
    const existing = await getUserByEmail(account.email);
    if (!existing) await createEmailUser({ email: account.email, name: account.name, passwordHash: demoHashPassword(account.password), role: account.role });
  }
  return DEMO_ACCOUNTS;
}

export async function getRecentAlerts(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alertDrafts).orderBy(desc(alertDrafts.createdAt)).limit(limit);
}

export async function createAlertDraft(input: typeof alertDrafts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(alertDrafts).values(input);
  const id = Number(result[0].insertId);
  return db.select().from(alertDrafts).where(eq(alertDrafts.id, id)).limit(1).then(rows => rows[0]);
}

export async function updateAlertStatus(id: number, status: NonNullable<typeof alertDrafts.$inferInsert.status>, actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(alertDrafts).set({ status, updatedAt: new Date(), ...(status === "ACKNOWLEDGED" ? { acknowledgedBy: actorId } : {}), ...(status === "APPROVED" ? { approvedBy: actorId } : {}) }).where(eq(alertDrafts.id, id));
  await createAuditEvent({ entityType: "alert", entityId: id, action: `status_${status.toLowerCase()}`, actorId });
  return db.select().from(alertDrafts).where(eq(alertDrafts.id, id)).limit(1).then(rows => rows[0]);
}

export async function getRecentFieldReports(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fieldReports).orderBy(desc(fieldReports.createdAt)).limit(limit);
}

export async function createFieldReport(input: typeof fieldReports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(fieldReports).values(input);
  const id = Number(result[0].insertId);
  await createAuditEvent({ entityType: "field_report", entityId: id, action: "created", actorId: input.submittedBy });
  return db.select().from(fieldReports).where(eq(fieldReports.id, id)).limit(1).then(rows => rows[0]);
}

export async function updateFieldReportStatus(id: number, status: NonNullable<typeof fieldReports.$inferInsert.status>, actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(fieldReports).set({ status, updatedAt: new Date() }).where(eq(fieldReports.id, id));
  await createAuditEvent({ entityType: "field_report", entityId: id, action: `status_${status.toLowerCase()}`, actorId });
  return db.select().from(fieldReports).where(eq(fieldReports.id, id)).limit(1).then(rows => rows[0]);
}

export async function createAuditEvent(input: typeof auditEvents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(auditEvents).values(input);
}

export async function getRecentAuditEvents(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(limit);
}

export async function getCommandTasks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(commandTasks);
}

export async function setCommandTaskStatus(taskKey: string, status: NonNullable<typeof commandTasks.$inferInsert.status>, actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const completedAt = status === "COMPLETED" ? new Date() : null;
  await db.insert(commandTasks).values({ taskKey, status, completedBy: status === "COMPLETED" ? actorId : null, completedAt }).onDuplicateKeyUpdate({ set: { status, completedBy: status === "COMPLETED" ? actorId : null, completedAt, updatedAt: new Date() } });
  await createAuditEvent({ entityType: "command_task", entityId: 0, action: `${taskKey}_${status.toLowerCase()}`, actorId });
  return db.select().from(commandTasks).where(eq(commandTasks.taskKey, taskKey)).limit(1).then(rows => rows[0]);
}

export async function getOperationalResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(operationalResources);
}

export async function getAssignmentCandidates() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(inArray(users.role, ["admin", "operator", "approver", "field_officer"]));
}

export async function updateOperationalResource(input: { resourceKey: string; resourceType: NonNullable<typeof operationalResources.$inferInsert.resourceType>; status: string; owner: string; assignedUserId?: number; note?: string }, actorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select().from(operationalResources).where(eq(operationalResources.resourceKey, input.resourceKey)).limit(1).then(rows => rows[0]);
  const assignedUserId = input.assignedUserId ?? existing?.assignedUserId ?? null;
  let resolvedOwner = input.owner;
  if (assignedUserId !== null) {
    const target = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(eq(users.id, assignedUserId)).limit(1).then(rows => rows[0]);
    if (!target || !["admin", "operator", "approver", "field_officer"].includes(target.role)) throw new Error("Selected user cannot own operational resources");
    resolvedOwner = target.name ?? target.email ?? `User #${target.id}`;
  }
  await db.insert(operationalResources).values({ resourceKey: input.resourceKey, resourceType: input.resourceType, status: input.status, owner: resolvedOwner, assignedUserId, note: input.note ?? null, updatedBy: actorId }).onDuplicateKeyUpdate({ set: { resourceType: input.resourceType, status: input.status, owner: resolvedOwner, assignedUserId, note: input.note ?? null, updatedBy: actorId, updatedAt: new Date() } });
  const row = await db.select().from(operationalResources).where(eq(operationalResources.resourceKey, input.resourceKey)).limit(1).then(rows => rows[0]);
  if (!row) throw new Error("Operational resource was not found after update");
  await createAuditEvent({ entityType: input.resourceType.toLowerCase(), entityId: row.id, action: `resource_${input.status.toLowerCase()}`, actorId, note: input.note ?? `Assigned to ${resolvedOwner}` });
  return row;
}

export async function recordSensorReadings(readings: Array<typeof sensorReadings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (!readings.length) return [];
  await db.insert(sensorReadings).values(readings);
  return db.select().from(sensorReadings).orderBy(desc(sensorReadings.receivedAt)).limit(readings.length);
}

export async function getRecentSensorReadings(sensorKey?: string, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return sensorKey
    ? db.select().from(sensorReadings).where(eq(sensorReadings.sensorKey, sensorKey)).orderBy(desc(sensorReadings.observedAt)).limit(limit)
    : db.select().from(sensorReadings).orderBy(desc(sensorReadings.observedAt)).limit(limit);
}

export async function recordFloodPrediction(input: typeof floodPredictions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(floodPredictions).values(input);
  return db.select().from(floodPredictions).where(eq(floodPredictions.id, Number(result[0].insertId))).limit(1).then(rows => rows[0]);
}

export async function getRecentFloodPredictions(locationKey: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(floodPredictions).where(eq(floodPredictions.locationKey, locationKey)).orderBy(desc(floodPredictions.generatedAt)).limit(limit);
}

export async function createFloodEvent(input: typeof floodEvents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(floodEvents).values(input);
  return db.select().from(floodEvents).where(eq(floodEvents.eventKey, input.eventKey)).limit(1).then(rows => rows[0]);
}

export async function getFloodEvents(locationKey: string, limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(floodEvents).where(eq(floodEvents.locationKey, locationKey)).orderBy(desc(floodEvents.startedAt)).limit(limit);
}

export async function recordAlertDecision(input: typeof alertDecisions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(alertDecisions).values(input);
  return db.select().from(alertDecisions).where(eq(alertDecisions.id, Number(result[0].insertId))).limit(1).then(rows => rows[0]);
}
