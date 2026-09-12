import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDharaliHistoricalWeather, getDharaliLiveData, historicalDharaliEvents } from "./liveData";
import { createAlertDraft, createFieldReport, getAssignmentCandidates, getCommandTasks, getOperationalResources, getRecentAlerts, getRecentAuditEvents, getRecentFieldReports, setCommandTaskStatus, updateAlertStatus, updateFieldReportStatus, updateOperationalResource } from "./db";

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
