import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return {
    passwordHash: derivedKey.toString("hex"),
    passwordSalt: salt,
  };
}

export async function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
  const derivedKey = await scrypt(password, passwordSalt, KEY_LENGTH);
  const storedKey = Buffer.from(passwordHash, "hex");
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}
