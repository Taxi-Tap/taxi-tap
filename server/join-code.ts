import { randomInt } from "node:crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

/** A random 9-character company code, e.g. K7M2QX4PA (shown as K7M-2QX-4PA). */
export function newJoinCode() {
  let code = "";
  for (let i = 0; i < 9; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

/** A 6-character code a customer types to pay a merchant request, e.g. K7M2QX. */
export function newRequestCode() {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

/** An 8-character code shown under the QR so a customer can read it out, e.g. K7M2QX4P. */
export function newQrCode() {
  let code = "";
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}
