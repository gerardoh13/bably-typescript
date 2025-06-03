"use strict";

/** Routes for feeds. */

import jsonschema from "jsonschema";

import Feed from "../models/feed";
import Infant from "../models/infant";
import Notification from "../models/notification";
import express from "express";
import { ensureLoggedIn, ensureCorrectUser } from "../middleware/auth";
import feedNewSchema from "../schemas/feedNew.json";
import feedUpdateSchema from "../schemas/feedUpdate.json";
import { BadRequestError, UnauthorizedError } from "../expressError";

const router = express.Router();

/** POST /:   { infant } => { infant }
 *
 * feed must include { firstName, dob, gender }
 *
 * Returns { id, firstName, dob, gender, publicId }
 *
 * Authorization required: none
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, feedNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack).join(", ");
      throw new BadRequestError(errs);
    }
    const userAccess = await Infant.checkAuthorized(
      res.locals.user.email,
      req.body.infant_id
    );
    if (!userAccess) throw new UnauthorizedError();
    if (userAccess) {
      const feed = await Feed.add(req.body);
      if (!userAccess.userIsAdmin && userAccess.notifyAdmin) {
        await Notification.sendNotification(
          res.locals.user.id,
          req.body.infant_id,
          "feed"
        );
      }
      res.status(201).json({ feed });
    }
  } catch (err) {
    return next(err);
  }
});

router.get("/:infant_id/:id", ensureLoggedIn, async function (req, res, next) {
  const { infant_id, id } = req.params;
  try {
    const userAccess = await Infant.checkAuthorized(
      res.locals.user.email,
      +infant_id
    );
    if (!userAccess) throw new UnauthorizedError();
    if (userAccess.crud) {
      const feed = await Feed.get(+id);
      res.json({ feed });
    }
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/:infant_id/:feed_id",
  ensureLoggedIn,
  async function (req, res, next) {
    const { infant_id, feed_id } = req.params;
    try {
      const validator = jsonschema.validate(req.body, feedUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack).join(", ");
        throw new BadRequestError(errs);
      }
      const userAccess = await Infant.checkAuthorized(
        res.locals.user.email,
        +infant_id
      );
      if (!userAccess) throw new UnauthorizedError();
      if (userAccess.crud) {
        const diaper = await Feed.update(+feed_id, req.body);
        res.json({ diaper });
      } else throw new UnauthorizedError();
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  "/:infant_id/:feed_id",
  ensureLoggedIn,
  async function (req, res, next) {
    const { infant_id, feed_id } = req.params;

    try {
      const userAccess = await Infant.checkAuthorized(
        res.locals.user.email,
        +infant_id
      );
      if (!userAccess) throw new UnauthorizedError();
      if (userAccess.crud) {
        await Feed.delete(+feed_id);
        res.json({ deleted: feed_id });
      }
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/reminders/:email/",
  ensureCorrectUser,
  async function (req, res, next) {
    const { email } = req.params;
    const { timestamp, infant } = req.body;
    try {
      Notification.scheduleFeedReminder(timestamp, infant, email);
      res.json({ scheduled: true });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;