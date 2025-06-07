import request from "supertest";
import app from "../app";
import {db} from "../db";

beforeEach(async () => {
  await db.query("DELETE FROM users"); // Clean slate between tests
});

afterAll(async () => {
  await db.end();
});

describe("User registration and login", () => {
  const testUser = {
    email: "testuser@example.com",
    password: "password123",
    firstName: "Testy",
  };

  test("Registers a new user and returns a token", async () => {
    const res = await request(app).post("/users/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  test("Fails to register duplicate email", async () => {
    await request(app).post("/users/register").send(testUser);
    const res = await request(app).post("/users/register").send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toMatch(/Duplicate email/i);
  });

  test("Logs in with valid credentials", async () => {
    await request(app).post("/users/register").send(testUser);
    const res = await request(app).post("/users/token").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("Fails login with bad password", async () => {
    await request(app).post("/users/register").send(testUser);
    const res = await request(app).post("/users/token").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toMatch(/Invalid email\/password/i);
  });
});
