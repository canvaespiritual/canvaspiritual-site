import { Pool } from "pg";

const databaseUrl =
  process.env.PRECHECKOUT_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "A variável PRECHECKOUT_DATABASE_URL não está configurada.",
  );
}

const useSsl =
  databaseUrl.includes("sslmode=require") ||
  databaseUrl.includes("railway.app") ||
  databaseUrl.includes("rlwy.net");

const globalForAnalytics = globalThis as unknown as {
  analyticsPool?: Pool;
};

export const analyticsDb =
  globalForAnalytics.analyticsPool ??
  new Pool({
    connectionString: databaseUrl,

    ssl: useSsl
      ? {
          rejectUnauthorized: false,
        }
      : undefined,

    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForAnalytics.analyticsPool =
    analyticsDb;
}