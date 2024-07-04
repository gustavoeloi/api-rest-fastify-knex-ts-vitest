import knex, { Knex } from "knex";

import { env } from "./env";

export const databaseConfig: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === "sqlite3"
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  migrations: {
    directory: "./database/migrations",
    extension: "ts",
  },
  useNullAsDefault: true,
};

export const database = knex(databaseConfig);
