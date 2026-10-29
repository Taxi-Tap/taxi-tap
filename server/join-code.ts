import { randomInt } from "node:crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

/** A random 9-character company code, e.g. K7M2QX4PA (shown as K7M-2QX-4PA). */
export function newJoinCode() {
  let code = "";
  for (let i = 0; i < 9; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}
