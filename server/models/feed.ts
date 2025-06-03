"use strict";

import { db } from "../db";
import { NotFoundError } from "../expressError";
import { sqlForPartialUpdate } from "../helpers/sql";

/** Related functions for feeds. */

export default class Feed {
  /** Register an infant (from data), update db, return new infant data.
   *
   * data should be { method, fed_at, amount, duration, infant_id }
   *
   * Returns { id, method, fed_at, amount, duration, infant_id }
   **/

  static async add(data: any) {
    const result = await db.query(
      `INSERT INTO feeds (method,
                        fed_at,
                        amount,
                        duration,
                        infant_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, method, fed_at, amount, duration, infant_id`,
      [data.method, data.fed_at, data.amount, data.duration, data.infant_id]
    );
    let feed = result.rows[0];

    return feed;
  }

  static async get(id: number) {
    const result = await db.query(
      `SELECT id,
              method,
              fed_at,
              amount,
              duration,
              infant_id
      FROM feeds 
      WHERE id = $1`,
      [id]
    );
    let feed = result.rows[0];

    return feed;
  }

  static async getTodays(infant_id: number, start: string, end: string) {
    const result = await db.query(
      `SELECT id,
              method,
              fed_at,
              amount,
              duration,
              infant_id
      FROM feeds 
      WHERE infant_id = $1 AND fed_at > $2 AND fed_at < $3
      ORDER BY fed_at DESC`,
      [infant_id, start, end]
    );
    let feeds = result.rows;

    return feeds;
  }

  static async update(id: number, data: string) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE feeds
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, method, fed_at, amount, duration, infant_id`;
    const result = await db.query(querySql, [...values, id]);
    const feed = result.rows[0];

    if (!feed) throw new NotFoundError(`No feed: ${id}`);

    return feed;
  }

  static async delete(id: number) {
    const result = await db.query(
      `DELETE
           FROM feeds
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const feed = result.rows[0];

    if (!feed) throw new NotFoundError(`No feed: ${id}`);
  }

  static async getEvents(infant_id: number, start: string, end: string) {
    const result = await db.query(
      `SELECT id,
              method,
              amount,
              duration,
              fed_at
      FROM feeds 
      WHERE infant_id = $1 AND fed_at > $2 AND fed_at < $3
      ORDER BY fed_at DESC`,
      [infant_id, start, end]
    );
    let feeds = result.rows.map((f) => this.formatEvent(f));

    return feeds;
  }
  static formatEvent(feed: any) {
    let title =
      feed.method === "bottle"
        ? `${feed.method} feed, ${feed.amount} oz`
        : `${feed.method}, ${feed.duration} mins`;
    let feedEvent = {
      title,
      id: `feed-${feed.id}`,
      start: feed.fed_at * 1000,
      end: feed.fed_at * 1000 + 30 * 60 * 1000,
      backgroundColor: "#66bdb8",
    };
    return feedEvent;
  }
}
