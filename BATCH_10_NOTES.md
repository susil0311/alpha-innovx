# Sahaayak Source Batch 10 — Google OAuth Migration

This batch removes the prior managed-platform authentication and runtime integration completely from the active project. Authentication now uses Google OAuth 2.0 with server-side ID-token verification through `google-auth-library`, CSRF-protected state cookies, signed application sessions, and role promotion through configured Google administrator email addresses.

## Required deployment variables

- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`, for example `https://your-service.example.com/api/auth/google/callback`
- Optional: `GOOGLE_ALLOWED_DOMAINS`, comma-separated email domains
- Optional: `GOOGLE_ADMIN_EMAILS`, comma-separated administrator email addresses

## Google Cloud Console setup

Create a Web application OAuth client and add the exact production callback URL to Authorized redirect URIs. The callback path is `/api/auth/google/callback`. The service can run on Railway or Render with `pnpm run build` and `pnpm start`; apply database migrations with `pnpm drizzle-kit migrate` before the first production start.

## Verification

The source was checked for stale platform identifiers, typechecked, tested, and production-built after the migration. The final archive excludes dependencies, build output, Git metadata, and local runtime logs.
