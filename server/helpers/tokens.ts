const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

export function createToken(user: any) {
  let payload = {
    email: user.email,
    id: user.id
  };
  return jwt.sign(payload, SECRET_KEY);
}

export function createPwdResetToken(user: any) {
  let payload = {
    email: user.email,
  };
  return jwt.sign(payload, user.password);
}