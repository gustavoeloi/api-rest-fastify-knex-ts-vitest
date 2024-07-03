import { app } from "../app";
import {
  afterAll,
  beforeAll,
  expect,
  it,
  describe,
  beforeEach,
  afterEach,
} from "vitest";
import request from "supertest";
import { execSync } from "node:child_process";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:latest");
  });

  afterEach(() => {
    execSync("npm run knex migrate:rollback --all");
  });

  it("should be able to create a new transaction", async () => {
    const transactionRequest = await request(app.server)
      .post("/transactions")
      .send({
        name: "New Transaction",
        amount: 3000,
        type: "credit",
      });

    console.log(transactionRequest.body);

    expect(transactionRequest.statusCode).toEqual(201);
  });

  it("should be able to list all transactions created", async () => {
    const response = await request(app.server)
      .post("/transactions")
      .send({
        name: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const cookies = response.get("Set-Cookie") ?? [];

    const listOfTransactionWithCookie = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listOfTransactionWithCookie.body.transactions).toMatchObject([
      {
        name: "New Transaction",
        amount: 5000,
      },
    ]);
  });

  it("should be able to list the summary of the transactions", async () => {
    const firstTransaction = await request(app.server)
      .post("/transactions")
      .send({
        name: "first transaction",
        amount: 8000,
        type: "credit",
      })
      .expect(201);

    const cookies = firstTransaction.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        name: "second transaction",
        amount: 5000,
        type: "debit",
      })
      .expect(201);

    const summary = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summary.body.summary).toMatchObject({
      amount: 3000,
    });
  });

  it("should be able to get a specific transaction", async () => {
    const transaction = await request(app.server)
      .post("/transactions")
      .send({
        name: "new transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const cookie = transaction.get("Set-Cookie") ?? [];

    const listOfTransactionWithCookie = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookie)
      .expect(200);

    const { id } = listOfTransactionWithCookie.body.transactions[0];

    const transactionById = await request(app.server)
      .get(`/transactions/${id}`)
      .set("Cookie", cookie)
      .expect(200);

    expect(transactionById.body).toMatchObject({
      id,
      name: "new transaction",
      amount: 5000,
    });
  });
});
