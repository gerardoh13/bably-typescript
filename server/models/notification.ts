import schedule from "node-schedule";
import { pushNotifications } from "../services";
import { db } from "../db";

export default class PushNotification {
  static async sendNotification(userId: number, infantId: number, type: string) {
    const adminAndChild = await db.query(
      `
      SELECT u.email,
             i.first_name AS "childName"
      FROM users u JOIN users_infants ui ON u.id = ui.user_id
      JOIN infants i ON i.id = ui.infant_id
      WHERE ui.infant_id = $1 AND ui.user_is_admin = true`,
      [infantId]
    );
    const nonAdminUser = await db.query(
      `
      SELECT u.first_name AS "name"
      FROM users u JOIN users_infants ui ON u.id = ui.user_id
      WHERE ui.infant_id = $1 AND ui.user_id = $2`,
      [infantId, userId]
    );
    const msg =
      type === "feed"
        ? `${nonAdminUser.rows[0].name} logged a new feed for ${adminAndChild.rows[0].childName}`
        : `${nonAdminUser.rows[0].name} logged a new diaper change for ${adminAndChild.rows[0].childName}`;
    pushNotifications
      .publishToUsers([adminAndChild.rows[0].email], {
        web: {
          notification: {
            title: `New ${type} logged.`,
            body: msg,
            icon: "https://res.cloudinary.com/dolnu62zm/image/upload/v1681800494/logo192_fkicpf.png"
          },
        },
      })
      .then((publishResponse) => {
        console.log("Just published:", publishResponse.publishId);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }

  static scheduleFeedReminder(timestamp: string, infant: any, email: string) {
    const date = new Date(timestamp);
    schedule.scheduleJob(date, () => {
      pushNotifications
        .publishToUsers([email], {
          web: {
            notification: {
              title: "Heads up!",
              body: `Time to feed ${infant}`,
              icon: "https://res.cloudinary.com/dolnu62zm/image/upload/v1681800494/logo192_fkicpf.png"
            },
          },
        })
        .then((publishResponse) => {
          console.log("Just published:", publishResponse.publishId);
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    });
  }
}
