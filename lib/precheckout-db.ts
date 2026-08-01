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

const globalForPrecheckout = globalThis as unknown as {
  precheckoutPool?: Pool;
};

export const precheckoutDb =
  globalForPrecheckout.precheckoutPool ??
  new Pool({
    connectionString: databaseUrl,

    ssl: useSsl
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrecheckout.precheckoutPool =
    precheckoutDb;
}