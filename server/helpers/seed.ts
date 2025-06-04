import { db } from '../db';
import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config.js";

export async function seed() {
    console.log("Seeding database...");
    try {
        const hashedPassword = await bcrypt.hash("password", BCRYPT_WORK_FACTOR);
        const checkDemo = await db.query(
            `SELECT * FROM users WHERE email = $1`,
            ["demo@demo.com"]
        );
        let demoUser;
        if (checkDemo.rows.length === 0) {
            demoUser = await db.query(
                `INSERT INTO users (email, first_name, password)
                 VALUES ($1, $2, $3) RETURNING id`,
                ["demo@demo.com", "DemoUser", hashedPassword]
            );
            console.log("Demo user created.");
        } else {
            console.log("Demo user already exists.");
        }
        const checkDemoReminders = await db.query(
            `SELECT * FROM reminders WHERE user_id = $1`,
            [checkDemo.rows[0]?.id || demoUser?.rows[0]?.id]
        );
        if (checkDemoReminders.rows.length === 0) {
            await db.query(
                `INSERT INTO reminders (user_id)
                 VALUES ($1)`,
                [checkDemo.rows[0]?.id || demoUser?.rows[0]?.id]
            );
            console.log("Demo user reminders created.");
        } else {
            console.log("Demo user reminders already exist.");
        }
        // Check for demo infant
        const checkDemoInfant = await db.query(
            `SELECT * FROM infants WHERE first_name = $1`,
            ["DemoBaby"]
        );
        let demoBaby;
        if (checkDemoInfant.rows.length === 0) {
            demoBaby = await db.query(
                `INSERT INTO infants (first_name, dob, gender, public_id)
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                ["DemoBaby", "2025-01-01", "male", "wcxhiinsaejwwh56nixq"]
            );
            console.log("Demo infant created.");
        } else {
            console.log("Demo infant already exists.");
        }

        // Always get the IDs from the select queries, or fallback to insert results
        const userId = checkDemo.rows[0]?.id || demoUser?.rows[0]?.id;
        const infantId = checkDemoInfant.rows[0]?.id || demoBaby?.rows[0]?.id;

        if (userId && infantId) {
            const checkDemoInfantUser = await db.query(
                `SELECT * FROM users_infants WHERE user_id = $1 AND infant_id = $2`,
                [userId, infantId]
            );
            if (checkDemoInfantUser.rows.length === 0) {
                await db.query(
                    `INSERT INTO users_infants (user_id, infant_id, user_is_admin, crud, notify_admin)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [userId, infantId, false, false, false]
                );
                console.log("Demo user-infant relationship created.");
            } else {
                console.log("Demo user-infant relationship already exists.");
            }
        } else {
            console.error("Could not determine userId or infantId for relationship.");
        }
        console.log("Database seeding completed.");
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}
