import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDharaliHistoricalWeather, getDharaliLiveData, historicalDharaliEvents } from "./liveData";
import { createAlertDraft, createEmailUser, createFieldReport, ensureDemoAccounts, getAssignmentCandidates, getCommandTasks, getOperationalResources, getRecentAlerts, getRecentAuditEvents, getRecentFieldReports, getUserByEmail, setCommandTaskStatus, updateAlertStatus, updateFieldReportStatus, updateOperationalResource } from "./db";
import { hashPassword, sdk, verifyPassword } from "./_core/sdk";

const roleProcedure = (roles: string[]) => protectedProcedure.use(({ ctx, next }) => {
  if (!roles.includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: `Role required: ${roles.join(", ")}` });
  return next({ ctx });
});

const operationsProcedure = roleProcedure(["admin", "operator", "approver", "user"]);
const fieldProcedure = roleProcedure(["admin", "operator", "field_officer"]);
const approverProcedure = roleProcedure(["admin", "approver"]);
const resourceUpdateProcedure = roleProcedure(["admin", "operator", "approver", "field_officer"]);
const resourceAssignProcedure = roleProcedure(["admin", "operator", "approver"]);

const alertInput = z.object({
  title: z.string().min(3),
  severity: z.enum(["YELLOW", "ORANGE", "RED"]),
  affectedVillages: z.string().min(2),
  validityFrom: z.coerce.date(),
  validityUntil: z.coerce.date(),
  expectedImpactAt: z.coerce.date().optional(),
  cascadeExplanation: z.string().min(5),
  recommendedAction: z.string().min(5),
  routeShelterDetails: z.string().min(5),
  confidence: z.number().int().min(0).max(100),
  englishMessage: z.string().min(10),
  hindiMessage: z.string().min(2),
  localMessage: z.string().optional(),
});

const reportInput = z.object({
  reportType: z.string().min(2),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  locationLabel: z.string().min(2),
  observedAt: z.coerce.date(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().min(5),
  waterDepth: z.string().optional(),
  roadBridgeStatus: z.string().optional(),
  sensorCondition: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const appRouter = router({
  system: systemRouter,
  liveData: router({
    dharali: publicProcedure.query(() => getDharaliLiveData()),
    historical: publicProcedure.query(() => historicalDharaliEvents),
    historicalWeather: publicProcedure.query(() => getDharaliHistoricalWeather()),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    demoAccounts: publicProcedure.query(() => ensureDemoAccounts()),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(320), password: z.string().min(8).max(128), role: z.enum(["operator", "approver", "field_officer", "viewer"]).default("viewer") })).mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase();
      if (await getUserByEmail(email)) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
      const user = await createEmailUser({ email, name: input.name, passwordHash: hashPassword(input.password), role: input.role });
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account could not be created." });
      const token = await sdk.createSessionToken({ openId: user.openId, name: user.name ?? input.name, email });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      return user;
    }),
    login: publicProcedure.input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(128) })).mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase();
      const user = await getUserByEmail(email);
      if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      const token = await sdk.createSessionToken({ openId: user.openId, name: user.name ?? email.split("@")[0], email });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      return user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  alerts: router({
    list: protectedProcedure.query(() => getRecentAlerts()),
    create: operationsProcedure.input(alertInput).mutation(({ input, ctx }) => createAlertDraft({ ...input, status: "DRAFT", createdBy: ctx.user.id })),
    updateStatus: approverProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["ACKNOWLEDGED", "APPROVED", "ISSUED", "CANCELLED", "EXPIRED"]) })).mutation(({ input, ctx }) => updateAlertStatus(input.id, input.status, ctx.user.id)),
  }),
  fieldReports: router({
    list: protectedProcedure.query(() => getRecentFieldReports()),
    create: fieldProcedure.input(reportInput).mutation(({ input, ctx }) => createFieldReport({ ...input, status: "NEW", submittedBy: ctx.user.id })),
    updateStatus: operationsProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["TRIAGED", "VERIFIED", "REJECTED"]) })).mutation(({ input, ctx }) => updateFieldReportStatus(input.id, input.status, ctx.user.id)),
  }),
  audit: router({
    list: protectedProcedure.query(() => getRecentAuditEvents()),
  }),
  commandTasks: router({
    list: protectedProcedure.query(() => getCommandTasks()),
    setStatus: operationsProcedure.input(z.object({ taskKey: z.string().min(2).max(32), status: z.enum(["PENDING", "COMPLETED"]) })).mutation(({ input, ctx }) => setCommandTaskStatus(input.taskKey, input.status, ctx.user.id)),
  }),
  resources: router({
    list: protectedProcedure.query(() => getOperationalResources()),
    assignmentCandidates: resourceAssignProcedure.query(() => getAssignmentCandidates()),
    updateStatus: resourceUpdateProcedure.input(z.object({ resourceKey: z.string().min(2).max(32), resourceType: z.enum(["ROUTE", "SHELTER"]), status: z.string().min(2).max(32), owner: z.string().min(2).max(120), assignedUserId: z.number().int().positive().optional(), note: z.string().max(500).optional() })).mutation(({ input, ctx }) => updateOperationalResource(input, ctx.user.id)),
    assign: resourceAssignProcedure.input(z.object({ resourceKey: z.string().min(2).max(32), resourceType: z.enum(["ROUTE", "SHELTER"]), status: z.string().min(2).max(32), owner: z.string().min(2).max(120), assignedUserId: z.number().int().positive() })).mutation(({ input, ctx }) => updateOperationalResource(input, ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
