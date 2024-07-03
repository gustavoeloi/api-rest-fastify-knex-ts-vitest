import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({
    path: ".env.test",
  });
} else {
  config();
}

console.log(process.env.NODE_ENV);

const environments = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
});

const _env = environments.safeParse(process.env);

if (_env.success === false) {
  console.error("⚠️ Invalid environments variables", _env.error.format());

  throw new Error("Please, fix your environments variables.");
}

export const env = _env.data;
