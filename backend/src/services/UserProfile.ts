import { hash } from "bcryptjs";
import { UserModel } from "../models/UserModel";
import { asString, EMAIL_RE, MIN_PASSWORD_LENGTH, MOBILE_RE } from "../utils/validate";

type ProfileResult =
  | { ok: true; updates: Record<string, string> }
  | { ok: false; status: number; message: string };

// Build a validated $set from the request body; only username, email, mobile (and optional password)
export const buildProfileUpdate = async (
  body: any,
  userId: string,
  { allowPassword }: { allowPassword: boolean },
): Promise<ProfileResult> => {
  const updates: Record<string, string> = {};

  if (body?.username !== undefined) {
    const username = asString(body.username).trim();
    if (username.length < 3 || username.length > 30) {
      return { ok: false, status: 400, message: "Username must be 3 to 30 characters" };
    }
    updates["username"] = username;
  }
  if (body?.email !== undefined) {
    const email = asString(body.email).trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return { ok: false, status: 400, message: "Invalid email address" };
    updates["email"] = email;
  }
  if (body?.mobile !== undefined) {
    const mobile = asString(body.mobile).trim();
    if (!MOBILE_RE.test(mobile)) {
      return { ok: false, status: 400, message: "Enter a valid 10-digit mobile number" };
    }
    updates["mobile"] = mobile;
  }
  if (allowPassword && body?.password) {
    const password = asString(body.password);
    if (password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, status: 400, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
    }
    updates["password"] = await hash(password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, status: 400, message: "Nothing to update" };
  }

  // username and email must stay unique
  const clash = await UserModel.findOne({
    _id: { $ne: userId },
    $or: [
      ...(updates["username"] ? [{ username: updates["username"] }] : []),
      ...(updates["email"] ? [{ email: updates["email"] }] : []),
    ],
  });
  if ((updates["username"] || updates["email"]) && clash) {
    const field = clash.username === updates["username"] ? "Username" : "Email";
    return { ok: false, status: 409, message: `${field} is already taken` };
  }

  return { ok: true, updates };
};
