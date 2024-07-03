import knex, { Knex } from "knex";

import { env } from "./env";

export const databaseConfig: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: env.DATABASE_URL,
  },
  migrations: {
    directory: "./database/migrations",
    extension: "ts",
  },
  useNullAsDefault: true,
};

export const database = knex(databaseConfig);
