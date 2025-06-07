import request from "supertest";
import app from "../app";
import {db} from "../db";

jest.mock("../models/notification", () => ({
  sendNotification: jest.fn(),
}));

let token: string;
let userId: number;
let infantId: number;

beforeEach(async () => {
  await db.query("DELETE FROM feeds");
  await db.query("DELETE FROM users_infants");
  await db.query("DELETE FROM infants");
  await db.query("DELETE FROM users");

  const userRes = await request(app).post("/users/register").send({
    email: "parent2@example.com",
    password: "securepass",
    firstName: "Parent2",
  });

  token = userRes.body.token;

  const userResult = await db.query(
    "SELECT id FROM users WHERE email = 'parent2@example.com'"
  );
  userId = userResult.rows[0].id;

  const infantRes = await request(app)
    .post(`/infants/register/${userId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      firstName: "Baby2",
      dob: "2024-01-01",
      gender: "female",
    });

  infantId = infantRes.body.infant.id;
});

afterAll(async () => {
  await db.end();
});

describe("POST /feeds", () => {
  test("Successfully logs a feed event", async () => {
    const res = await request(app)
      .post("/feeds")
      .set("Authorization", `Bearer ${token}`)
      .send({
        method: "bottle",
        fed_at: 1701419220,
        amount: 4.5,
        infant_id: infantId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.feed).toHaveProperty("id");
    expect(res.body.feed.method).toBe("bottle");
    expect(res.body.feed.amount).toBe(4.5);
  });

  test("Fails with missing required fields", async () => {
    const res = await request(app)
      .post("/feeds")
      .set("Authorization", `Bearer ${token}`)
      .send({
        method: "nursing",
        infant_id: infantId,
        // missing fed_at, amount, duration
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toMatch(/fed_at/);
  });
});
