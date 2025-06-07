import request from "supertest";
import app from "../app";
import {db} from "../db";

// Mock notifications to prevent test side effects
jest.mock("../models/notification", () => ({
  sendNotification: jest.fn(),
}));

let token: string;
let userId: number;
let infantId: number;

beforeEach(async () => {
  await db.query("DELETE FROM diapers");
  await db.query("DELETE FROM users_infants");
  await db.query("DELETE FROM infants");
  await db.query("DELETE FROM users");

  // Register and login a user
  const userRes = await request(app).post("/users/register").send({
    email: "parent@example.com",
    password: "securepass",
    firstName: "Parent",
  });

  token = userRes.body.token;

  const userResult = await db.query("SELECT id FROM users WHERE email = 'parent@example.com'");
  userId = userResult.rows[0].id;

  // Register an infant
  const infantRes = await request(app)
    .post(`/infants/register/${userId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      firstName: "Baby",
      dob: "2024-01-01",
      gender: "male",
    });

  infantId = infantRes.body.infant.id;
});

afterAll(async () => {
  await db.end();
});

describe("POST /diapers", () => {
  test("Successfully adds a diaper event", async () => {
    const res = await request(app)
      .post("/diapers")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "wet",
        size: "medium",
        changed_at: 1701419220,
        infant_id: infantId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.diaper).toHaveProperty("id");
    expect(res.body.diaper.type).toBe("wet");
  });

  test("Fails with missing fields", async () => {
    const res = await request(app)
      .post("/diapers")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "soiled",
        infant_id: infantId, // missing size and changed_at
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toMatch(/size/);
    expect(res.body.error.message).toMatch(/changed_at/);

  });
});
