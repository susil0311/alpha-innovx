import { desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import { alertDrafts, auditEvents, commandTasks, fieldReports, InsertUser, operationalResources, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

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
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
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
