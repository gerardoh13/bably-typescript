"use strict";

/** Routes for authentication. */

import jsonschema from "jsonschema";

import User from "../models/user";
import Email from "../models/email";
import express from "express";
import { ensureCorrectUser, ensureCorrectUserAllowDemo } from "../middleware/auth";
import { createToken, createPwdResetToken } from "../helpers/tokens";
import userAuthSchema from "../schemas/userAuth.json";
import userNewSchema from "../schemas/userNew.json";
import { BadRequestError } from "../expressError";
import jwt from "jsonwebtoken";
import { pushNotifications } from "../services";

const router = express.Router();

/** POST /auth/token:  { email, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 *         // await Email.send()

 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack).join(", ");
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;
    const user = await User.authenticate(email, password);
    const token = createToken(user);
    res.json({ token });
  } catch (err) {
    return next(err);
  }
});

router.post("/reset", async function (req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.getWithPassword(email);
    const token = createPwdResetToken(user);
    await Email.sendPwdReset(email, token);
    res.json({ emailSent: true });
  } catch (err) {
    return next(err);
  }
});

router.post("/new-password", async function (req, res, next) {
  try {
    const { token } = req.query;
    const { email, password } = req.body;
    if (typeof token !== "string") {
      throw new BadRequestError("Invalid or missing token");
    }
    const user = await User.getWithPassword(email);
    const tokenUser = jwt.verify(token, user.password);
    if (user.email === (tokenUser as any).email) {
      await User.update(email, { password: password });
      res.json({ passwordUpdated: true });
    }
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { email, password, firstName  }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack).join(", ");
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body });
    const token = createToken(newUser);
    res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

/** GET /[email] => { user }
 *
 * Returns { id, email, firstName, infants }
 *   where infants is {  }
 *
 * Authorization required: same user-as-:email
 **/

router.get("/:email", ensureCorrectUserAllowDemo, async function (req, res, next) {
  try {
    const user = await User.get(req.params.email);
    res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/reminders/:email",
  ensureCorrectUser,
  async function (req, res, next) {
    const { email } = req.params;
    try {
      await User.updateReminders(email, req.body);
      res.json({ updated: true });
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/pusher/beams-auth", function (req, res, next) {
  const userIDInQueryParam = req.query["user_id"];
  try {
    const user = res.locals.user;
    if (!(user && user.email === userIDInQueryParam)) {
      throw new BadRequestError();
    }
    const beamsToken = pushNotifications.generateToken(userIDInQueryParam?.toString() || "");
    res.send(JSON.stringify(beamsToken));
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/notify-admin/:userId/:infantId",
  async function (req, res, next) {
    const { userId, infantId } = req.params;
    const { notifyAdmin } = req.body;
    try {
      const notify = await User.updateNotifications(
        notifyAdmin,
        +userId,
        +infantId
      );
      res.json({ notify });
    } catch (err) {
      return next(err);
    }
  }
);

router.patch("/access/:userId/:infantId", async function (req, res, next) {
  const { userId, infantId } = req.params;
  const { crud } = req.body;
  try {
    const access = await User.updateAcess(crud, +userId, +infantId);
    res.json({ access });
  } catch (err) {
    return next(err);
  }
});

router.delete("/access/:userId/:infantId", async function (req, res, next) {
  const { userId, infantId } = req.params;
  try {
    await User.removeAccess(+userId, +infantId);
    res.json({ removedAccess: +userId });
  } catch (err) {
    return next(err);
  }
});

export default router;