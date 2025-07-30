import "dotenv/config";
import type { Config } from "drizzle-kit";

console.log("Reading DATABASE_URL:", process.env.DATABASE_URL);

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
