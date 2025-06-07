"use strict";

/** Convenience middleware to handle common auth cases in routes. */

import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { UnauthorizedError } from "../expressError";
import { NextFunction, Request, Response } from 'express';

if (!SECRET_KEY) {
  throw new Error("SECRET_KEY must be set in order to use authentication middleware");
}

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the email field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY as string);

    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

export function ensureLoggedInAllowDemo(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

export function ensureLoggedIn(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!res.locals.user || res.locals.user.email === "demo@demo.com") throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}
/** Middleware to use when they must provide a valid token & be user matching
 *  email provided as route param.
 *
 *  If not, raises Unauthorized.
 */

export function ensureCorrectUserAllowDemo(req: Request, res: Response, next: NextFunction): void {
  try {
    const user = res.locals.user;
    if (!(user && user.email === req.params.email)) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    console.log("ERR", err)
    return next(err);
  }
}

export function ensureCorrectUser(req: Request, res: Response, next: NextFunction): void {
  try {
    const user = res.locals.user;
    if (!(user && user.email === req.params.email) || user.email === "demo@demo.com") {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    console.log("ERR", err)
    return next(err);
  }
}