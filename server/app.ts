"use strict";

import express from "express";
import cors from "cors";

import { NotFoundError } from "./expressError";

import { authenticateJWT } from "./middleware/auth";
import usersRoutes from "./routes/users";
import infantRoutes from "./routes/infants";
import feedRoutes from "./routes/feeds";
import diaperRoutes from "./routes/diapers";
import { Request, Response, NextFunction } from "express";
import { PORT } from "./config";
import { seed } from "./helpers/seed";
const app = express();

const corsOptions = {
  origin: ['https://bablyapp.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(authenticateJWT);

app.use("/users", usersRoutes);
app.use("/infants", infantRoutes);
app.use("/feeds", feedRoutes);
app.use("/diapers", diaperRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use(function (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status: number = err.status || 500;
  const message: string = err.message;

  res.status(status).json({
    error: { message, status },
  });
});

app.listen(PORT, async function () {
  console.log(`Started on http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== "test") {
    try {
      await seed();
      console.log("Test database seeded successfully.");
    } catch (err) {
      console.error("Error seeding test database:", err);
    }
  }
});

export default app;