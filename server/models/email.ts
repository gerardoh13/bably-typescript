"use strict";
import { transporter } from "../services";
import { REACT_APP_HOST } from "../config";

export default class Email {
  static async sendInvite(email: string, sentBy: string, infantName: string) {
    let info = await transporter.sendMail({
      from: '"Bably Team" <donotreply@bably.com>', // sender address
      to: email, // list of receivers
      subject: "Get Started With Bably", // Subject line
      //   text: "Hello from bably team!", // plain text body
      html: `<div style="text-align: center;">
      <h2>${sentBy} has invited you to join Bably</h2>
      <p>${sentBy} has shared access to ${infantName} profile</p>
      <p>follow the link below to create an account</p>
      <a href=${REACT_APP_HOST}>create an account</a>
      </div>`, // html body
    });
    console.log("Message sent: %s", info.messageId);
  }

  static async sendPwdReset(email: string, token: string) {
    let info = await transporter.sendMail({
      from: '"Bably Team" <donotreply@bably.com>', // sender address
      to: email, // list of receivers
      subject: "Reset your Bably password", // Subject line
      html: `<div style="text-align: center;">
      <h1>Forgot your Password? We've got you covered.</h1>
      <h3>follow the link below to reset your password</h3>
      <a href="${REACT_APP_HOST}/reset?token=${token}">reset password</a>
      </div>`, // html body
    });
    console.log("Message sent: %s", info.messageId);
  }
}
