import { Types } from "mongoose";

// Returns the value only if it is a string. Anything else (objects like {"$ne": null},
// arrays, numbers) becomes "" so it can never be used as a MongoDB query operator.
export const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

// true when the value is a valid 24-char MongoDB ObjectId string
export const isValidId = (value: unknown): value is string =>
  typeof value === "string" && Types.ObjectId.isValid(value) && /^[a-f\d]{24}$/i.test(value);

// Escape user text so it is matched literally inside a RegExp
export const escapeRegex = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Copy only the allowed keys from an untrusted object (e.g. req.body)
export const pickFields = (source: unknown, allowed: readonly string[]): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  if (source && typeof source === "object") {
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        result[key] = (source as Record<string, unknown>)[key];
      }
    }
  }
  return result;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_RE = /^[6-9]\d{9}$/;
export const MIN_PASSWORD_LENGTH = 6;
