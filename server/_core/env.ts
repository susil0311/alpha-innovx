const splitCsv = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
  googleAllowedDomains: splitCsv(process.env.GOOGLE_ALLOWED_DOMAINS),
  googleAdminEmails: splitCsv(process.env.GOOGLE_ADMIN_EMAILS),
  isProduction: process.env.NODE_ENV === "production",
};
