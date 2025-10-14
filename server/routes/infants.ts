"use strict";

/** Routes for infants. */

import jsonschema from "jsonschema";

import Infant from "../models/infant";
import User from "../models/user";
import Feed from "../models/feed";
import Diaper from "../models/diaper";
import Email from "../models/email";
import express from "express";
import infantNewSchema from "../schemas/infantNew.json";
import { BadRequestError, UnauthorizedError } from "../expressError";
import { ensureLoggedIn, ensureLoggedInAllowDemo } from "../middleware/auth";
import { getTodaysDemoData, getDemoCalendarData } from "../helpers/demo";

const router = express.Router();

/** POST /register/:userId:   { infant } => { infant }
 *
 * infant must include { firstName, dob, gender }
 *
 * Returns { id, firstName, dob, gender, publicId }
 *
 * Authorization required: none
 */

router.post(
  "/register/:userId",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, infantNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack).join(", ");
        throw new BadRequestError(errs);
      }
      const infant = await Infant.register(req.body, +req.params.userId);
      res.status(201).json({ infant });
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/:infantId", ensureLoggedInAllowDemo, async function (req, res, next) {
  const { infantId } = req.params;
  try {
    const userAccess = await Infant.checkAuthorized(
      res.locals.user.email,
      +infantId
    );
    if (userAccess) {
      const infant = await Infant.get(+infantId, res.locals.user.id);
      res.json({ infant });
    } else throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});

router.patch("/:infantId", ensureLoggedIn, async function (req, res, next) {
  const { infantId } = req.params;
  try {
    const validator = jsonschema.validate(req.body, infantNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack).join(", ");
      throw new BadRequestError(errs);
    }
    const userAccess = await Infant.checkAuthorized(
      res.locals.user.email,
      +infantId
    );
    if (userAccess.userIsAdmin) {
      const infant = await Infant.update(
        +infantId,
        req.body,
        res.locals.user.id
      );
      res.json({ infant });
    } else throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/events/:infantId/:start/:end",
  ensureLoggedInAllowDemo,
  async function (req, res, next) {
    const { infantId, start, end } = req.params;
    if (res.locals.user.email === "demo@demo.com") {
      // For demo purposes, return static data
      const demoData = getDemoCalendarData();
      if (start === "0" && end === "1") {
        // If start and end are 0 and 1, return all demo data
        res.json({ events: demoData });
      } else {
        // Filter demo data based on start and end
        const filteredFeeds = demoData.feeds.filter(
          (f) => f.start >= +start * 1000 && f.start <= +end * 1000
        );
        const filteredDiapers = demoData.diapers.filter(
          (d) => d.start >= +start * 1000 && d.start <= +end * 1000
        );
        res.json({ events: { feeds: filteredFeeds, diapers: filteredDiapers } });
      }
      return;
    }
    try {
      const userAccess = await Infant.checkAuthorized(
        res.locals.user.email,
        +infantId
      );
      if (userAccess) {
        let events: { feeds: any[]; diapers: any[] } = { feeds: [], diapers: [] };
        events.feeds = await Feed.getEvents(+infantId, start, end);
        events.diapers = await Diaper.getEvents(+infantId, start, end);
        res.json({ events });
      } else throw new UnauthorizedError();
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/today/:infantId/:start/:end",
  ensureLoggedInAllowDemo,
  async function (req, res, next) {
    const { infantId, start, end } = req.params;
    if (res.locals.user.email === "demo@demo.com") {
      // For demo purposes, return static data
      const demoData = getTodaysDemoData();
      res.json({ today: demoData });
      return;
    }
    try {
      const userAccess = await Infant.checkAuthorized(
        res.locals.user.email,
        +infantId
      );
      if (userAccess) {
        let today: { feeds: any[]; diapers: any[] } = { feeds: [], diapers: [] };
        today.feeds = await Feed.getTodays(+infantId, start, end);
        today.diapers = await Diaper.getTodays(+infantId, start, end);
        res.json({ today });
      } else throw new UnauthorizedError();
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/auth-users/:infantId",
  ensureLoggedIn,
  async function (req, res, next) {
    const { infantId } = req.params;
    try {
      const userAccess = await Infant.checkAuthorized(
        res.locals.user.email,
        +infantId
      );
      if (userAccess) {
        const users = await Infant.getAuthorizedUsers(
          +infantId,
          res.locals.user.id
        );
        res.json({ users });
      } else throw new UnauthorizedError();
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/add-user/:infantId",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { infantId } = req.params;
      const { sentTo, sentByName, sentById, crud, infantName } = req.body;
      const userAccess = await Infant.checkAuthorized(
        res.locals.user.email,
        +infantId
      );
      if (userAccess.userIsAdmin) {
        const user = await User.checkIfRegistered(sentTo);
        let details = { recipient: "", inviteSent: false, previouslyAdded: false };

        if (user) {
          details.recipient = user.firstName;
          details.inviteSent = false;
          // send email
          const addedtoTable = await Infant.addAuthorizedUser(
            user.id,
            +infantId,
            crud
          );
          if (!addedtoTable) {
            details.previouslyAdded = true;
          }
        } else {
          await User.addInvitation(sentById, +infantId, crud, sentTo);
          await Email.sendInvite(sentTo, sentByName, infantName);
          details.inviteSent = true;
        }
        res.json({ details });
      } else throw new UnauthorizedError();
    } catch (err) {
      return next(err);
    }
  }
);

export default router;