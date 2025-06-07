"use strict";

import { db } from "../db";
import bcrypt from "bcrypt";
import { sqlForPartialUpdate } from "../helpers/sql";
import { NotFoundError, BadRequestError, UnauthorizedError } from "../expressError";

import { BCRYPT_WORK_FACTOR } from "../config";

/** Related functions for users. */

export default class User {
  /** authenticate user with email, password.
   *
   * Returns { id, email, first_name }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/

  static async authenticate(email: string, password: string) {
    // try to find the user first
    const result = await db.query(
      `SELECT id,
                  email,
                  password,
                  first_name AS "firstName"
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid email/password");
  }

  /** Register user with data.
   *
   * Returns { email, first_name }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ email, password, firstName }: { email: string; password: string; firstName: string }) {
    const duplicateCheck = await db.query(
      `SELECT email
           FROM users
           WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (email,
            password,
            first_name)
           VALUES ($1, $2, $3)
           RETURNING id, email, first_name AS "firstName"`,
      [email, hashedPassword, firstName]
    );

    const user = result.rows[0];

    const invitationCheck = await db.query(
      `SELECT infant_id,
              crud
              FROM invitations
          WHERE sent_to = $1`,
      [email]
    );

    const invitation = invitationCheck.rows[0];

    if (invitation) {
      await db.query(
        `INSERT INTO users_infants
          (user_id,
          infant_id,
          user_is_admin,
          crud)
          VALUES ($1, $2, $3, $4)`,
        [user.id, invitation.infant_id, false, invitation.crud]
      );
    }
    await db.query(
      `INSERT INTO reminders
              (user_id)
              VALUES ($1)`,
      [user.id]
    );

    return user;
  }

  static async getWithPassword(email: string) {
    const userRes = await db.query(
      `SELECT id,
              email,
              first_name AS "firstName",
              password
           FROM users
           WHERE email = $1`,
      [email]
    );
    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user: ${email}`);
    return user;
  }

  static async checkIfRegistered(email: string) {
    const userRes = await db.query(
      `SELECT id,
              email,
              first_name AS "firstName"
           FROM users
           WHERE email = $1`,
      [email]
    );
    const user = userRes.rows[0];

    return user;
  }

  static async addInvitation(sentBy: string, infant_id: number, crud: boolean, sentTo: string) {
    const invitationCheck = await db.query(
      `SELECT infant_id,
              crud
              FROM invitations
          WHERE sent_by = $1 AND sent_to = $2 AND infant_id = $3`,
      [sentBy, sentTo, infant_id]
    );

    const invitation = invitationCheck.rows[0];

    if (invitation) return;

    await db.query(
      `INSERT INTO invitations
               (sent_by,
                infant_id,
                crud,
                sent_to)
                VALUES ($1, $2, $3, $4)`,
      [sentBy, infant_id, crud, sentTo]
    );
  }

  /** Given an email, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(email: string) {
    const userRes = await db.query(
      `SELECT id,
              email,
              first_name AS "firstName"
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${email}`);

    const infantsRes = await db.query(
      `SELECT i.id,
              i.first_name AS "firstName",
              ui.user_is_admin AS "userIsAdmin",
              ui.crud
           FROM infants i
           JOIN users_infants ui ON i.id = ui.infant_id
           WHERE ui.user_id = $1`,
      [user.id]
    );

    const reminderRes = await db.query(
      `SELECT id,
              enabled,
              hours,
              minutes,
              cutoff_enabled AS "cutoffEnabled",
              cutoff,
              start
           FROM reminders
           WHERE user_id = $1`,
      [user.id]
    );

    user.infants = infantsRes.rows;
    user.reminders = reminderRes.rows[0];

    return user;
  }

  static async updateReminders(email: string, data: any) {
    const userRes = await db.query(
      `SELECT id
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No reminders for user: ${email}`);

    const { setCols, values } = sqlForPartialUpdate(data, {
      cutoffEnabled: "cutoff_enabled",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE reminders
                      SET ${setCols} 
                      WHERE user_id = ${idVarIdx} 
                      RETURNING id, enabled, hours, minutes, cutoff_enabled AS "cutoffEnabled", cutoff, start`;
    const result = await db.query(querySql, [...values, user.id]);
    const reminders = result.rows[0];

    return reminders;
  }

  static async updateNotifications(notifyAdmin: boolean, userId: number, infantId: number) {
    const notifyRes = await db.query(
      `UPDATE users_infants
      SET notify_admin = $1
      WHERE user_id = $2 AND infant_id = $3
      RETURNING user_id AS "userId", infant_id AS "infantId", notify_admin AS "notifyAdmin"`,
      [notifyAdmin, userId, infantId]
    );
    const notify = notifyRes.rows[0];

    return notify;
  }

  static async updateAcess(crud: boolean, userId: number, infantId: number) {
    const accessRes = await db.query(
      `UPDATE users_infants
      SET crud = $1
      WHERE user_id = $2 AND infant_id = $3
      RETURNING user_id AS "userId", infant_id AS "infantId", crud`,
      [crud, userId, infantId]
    );
    const access = accessRes.rows[0];

    return access;
  }

  static async removeAccess(userId: number, infantId: number) {
    const result = await db.query(
      `DELETE
       FROM users_infants
       WHERE user_id = $1 AND infant_id = $2
       RETURNING user_id`,
      [userId, infantId]
    );
    const relation = result.rows[0];

    if (!relation)
      throw new NotFoundError(`No user/infant relation: ${userId}/${infantId}`);
  }
  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, password, email }
   *
   * Returns { id, email, firstName }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(email: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
    });
    const emailVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE email = ${emailVarIdx} 
                      RETURNING id,
                                first_name AS "firstName",
                                email`;
    const result = await db.query(querySql, [...values, email]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${email}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(email: string) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE email = $1
           RETURNING email`,
      [email]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${email}`);
  }
}
