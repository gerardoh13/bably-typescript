"use strict";

import { getDatabaseUri } from "./config";
import { Pool } from "pg";


let db: Pool;

if (process.env.NODE_ENV === "production") {
  db = new Pool({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Pool({
    connectionString: getDatabaseUri(),
  });
}

export { db };

// db.connect();
