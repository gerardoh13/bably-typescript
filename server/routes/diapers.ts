"use strict";

/** Routes for diapers. */

import jsonschema from "jsonschema";

import Diaper from "../models/diaper";
import Infant from "../models/infant";
import Notification from "../models/notification";
import express from "express";
import { ensureLoggedIn } from "../middleware/auth";
import diaperNewSchema from "../schemas/diaperNew.json";
import diaperUpdateSchema from "../schemas/diaperUpdate.json";
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
    const validator = jsonschema.validate(req.body, diaperNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack).join(", ");
      throw new BadRequestError(errs);
    }
    const userAccess = await Infant.checkAuthorized(
      res.locals.user.email,
      req.body.infant_id
    );
    if (userAccess) {
      const diaper = await Diaper.add(req.body);
      if (!userAccess.userIsAdmin && userAccess.notifyAdmin) {
        await Notification.sendNotification(
          res.locals.user.id,
          req.body.infant_id,
          "diaper"
        );
      }
      res.status(201).json({ diaper });
    } else throw new UnauthorizedError();
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
      const diaper = await Diaper.get(+id);
      res.json({ diaper });
    }
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/:infant_id/:diaper_id",
  ensureLoggedIn,
  async function (req, res, next) {
    const { infant_id, diaper_id } = req.params;
    try {
      const validator = jsonschema.validate(req.body, diaperUpdateSchema);
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
        const diaper = await Diaper.update(+diaper_id, req.body);
        res.json({ diaper });
      }
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  "/:infant_id/:diaper_id",
  ensureLoggedIn,
  async function (req, res, next) {
    const { infant_id, diaper_id } = req.params;
    try {
      const userAccess = await Infant.checkAuthorized(
        res.locals.user.email,
        +infant_id
      );
      if (!userAccess) throw new UnauthorizedError();
      if (userAccess.crud) {
        await Diaper.delete(+diaper_id);
        res.json({ deleted: diaper_id });
      }
    } catch (err) {
      return next(err);
    }
  }
);

export default router;