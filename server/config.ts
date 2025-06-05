"use strict";

require("dotenv").config();

export const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

export const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

export const REACT_APP_HOST = process.env.REACT_APP_HOST || "http://localhost:5173"

export const NODEMAILER_USER = process.env.NODEMAILER_USER;

export const NODEMAILER_PWD = process.env.NODEMAILER_PWD;

export const BEAMS_INSTANCE_ID = process.env.BEAMS_INSTANCE_ID;

export const BEAMS_SECRET_KEY = process.env.BEAMS_SECRET_KEY;

export function getDatabaseUri() {
  if (process.env.NODE_ENV === "test") {
    return process.env.TEST_DATABASE_URL;
  }
  // For production and development
  return process.env.DATABASE_URL;
}

export const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

