import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "packages/db",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
