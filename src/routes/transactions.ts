import { FastifyInstance } from "fastify";
import { z } from "zod";

import crypto from "node:crypto";
import { database } from "../database";
import { validateCookieOnRequest } from "../middlewares/validate-cookie-on-request";

export async function transactionsRoutes(app: FastifyInstance) {
  app.post("/", async (req, reply) => {
    const transactionCreateBodySchema = z.object({
      name: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { name, amount, type } = transactionCreateBodySchema.parse(req.body);

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await database("transactions").insert({
      id: crypto.randomUUID(),
      name,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });

  app.get(
    "/",
    {
      preHandler: [validateCookieOnRequest],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies;

      const transactions = await database("transactions")
        .where("session_id", sessionId)
        .select();

      return reply.status(200).send({
        transactions,
      });
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [validateCookieOnRequest],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies;

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(req.params);

      const transaction = await database("transactions")
        .where({
          session_id: sessionId,
          id,
        })
        .first();

      return reply.code(200).send(transaction);
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [validateCookieOnRequest],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies;

      const summaryOfTransactions = await database("transactions")
        .where("session_id", sessionId)
        .sum("amount", {
          as: "amount",
        })
        .first();

      reply.status(200).send({
        summary: summaryOfTransactions,
      });
    }
  );
}
