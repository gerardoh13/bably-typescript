"use strict";
import nodemailer from "nodemailer";
import PushNotifications from "@pusher/push-notifications-server";
import { NODEMAILER_PWD, NODEMAILER_USER, BEAMS_INSTANCE_ID, BEAMS_SECRET_KEY } from "./config";

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PWD,
  },
});

if (!BEAMS_INSTANCE_ID || !BEAMS_SECRET_KEY) {
  throw new Error("BEAMS_INSTANCE_ID and BEAMS_SECRET_KEY must be defined");
}

export const pushNotifications = new PushNotifications({
  instanceId: BEAMS_INSTANCE_ID,
  secretKey: BEAMS_SECRET_KEY,
});
