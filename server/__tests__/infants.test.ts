import request from "supertest";
import app from "../app";
import {db} from "../db";

let token: string;
let userId: number;

beforeEach(async () => {
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

  const result = await db.query("SELECT id FROM users WHERE email = 'parent@example.com'");
  userId = result.rows[0].id;
});

afterAll(async () => {
  await db.end();
});

describe("POST /infants/register/:userId", () => {
  test("Successfully registers an infant", async () => {
    const res = await request(app)
      .post(`/infants/register/${userId}`)
      .send({
        firstName: "Baby",
        dob: "2024-01-01",
        gender: "male",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.infant).toHaveProperty("id");
    expect(res.body.infant.firstName).toBe("Baby");
    expect(res.body.infant.gender).toBe("male");
  });

  test("Fails to register with invalid data", async () => {
    const res = await request(app)
      .post(`/infants/register/${userId}`)
      .send({
        firstName: 123, // invalid type
        dob: "bad-date",
        gender: "dragon", // invalid enum
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toMatch(/instance\.firstName/i);
  });
});
