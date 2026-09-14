# Flood Nexus Source Batch 02

This batch upgrades the Flood Nexus prototype from seeded-only UI to an authenticated full-stack application with role-aware persistence.

## Included capabilities

- Google OAuth session handling through the managed `useAuth` hook.
- Extended user roles: `admin`, `operator`, `approver`, `field_officer`, `viewer`, and `user`.
- Persistent alert drafts with acknowledgement, approval, issuance, cancellation, and expiry states.
- Persistent field reports with triage, verification, and rejection states.
- Audit events for alert and field-report creation and status changes.
- Protected tRPC procedures under `/api/trpc`.
- Operator sign-in affordance in the control-room header.
- Field-report submission persistence for authenticated field officers, operators, and administrators.
- Alert-draft persistence for authenticated users, operators, approvers, and administrators; approval remains restricted to approvers and administrators.

## Main implementation files

- `drizzle/schema.ts` — users, alert drafts, field reports, and audit tables.
- `drizzle/0000_huge_iron_man.sql` — generated schema migration.
- `server/db.ts` — Drizzle query and audit helpers.
- `server/routers.ts` — role-aware tRPC procedures and validation schemas.
- `client/src/_core/hooks/useAuth.ts` — Google OAuth-backed session state.
- `client/src/pages/ControlRoom.tsx` — authenticated role chip and alert-draft persistence.
- `client/src/pages/FieldReports.tsx` — authenticated field-report persistence.

## Run and verify

```bash
pnpm install
pnpm run check
pnpm test
pnpm run build
```

The project expects `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI`. Optional `GOOGLE_ALLOWED_DOMAINS` and `GOOGLE_ADMIN_EMAILS` values control access and administrator promotion. Do not commit `.env` files or credentials.
