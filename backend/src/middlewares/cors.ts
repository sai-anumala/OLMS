import { NextFunction, Request, Response } from "express";
import cors from "cors";

// Normalize a URL to its lowercase origin, e.g. "HTTPS://Olms.online/x" -> "https://olms.online"
export const normalizeOrigin = (value: string): string | null => {
  try {
    return new URL(value.trim()).origin.toLowerCase();
  } catch {
    return null;
  }
};

const isProduction = () => process.env["NODE_ENV"] === "production";

// Allowed origins from FRONTEND_URL (comma-separated)
const configuredOrigins = (): Set<string> => {
  const raw = process.env["FRONTEND_URL"] || "";
  const origins = new Set<string>();
  for (const entry of raw.split(",")) {
    if (!entry.trim()) continue;
    const origin = normalizeOrigin(entry);
    if (origin) origins.add(origin);
    else console.warn(`[cors] Ignoring invalid FRONTEND_URL entry: "${entry.trim()}"`);
  }
  return origins;
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

// true for http://localhost:<any port>, http://127.0.0.1:<port>, http://[::1]:<port>
const isLocalDevOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

export const createOriginChecker = () => {
  const allowed = configuredOrigins();
  const allowLocalDev = !isProduction();
  return (origin: string): boolean => {
    const normalized = normalizeOrigin(origin);
    if (!normalized) return false;
    return allowed.has(normalized) || (allowLocalDev && isLocalDevOrigin(normalized));
  };
};

// Builds the CORS middleware plus a guard against cross-site write requests.
export const corsMiddleware = () => {
  const isAllowedOrigin = createOriginChecker();
  const warned = new Set<string>();
  const warnOnce = (origin: string) => {
    if (warned.has(origin) || warned.size > 100) return;
    warned.add(origin);
    console.warn(`[cors] Blocked request from origin ${origin}. Add it to FRONTEND_URL if it is your frontend.`);
  };

  const corsHandler = cors({
    origin: (origin, callback) => {
      // no Origin header: same-origin requests, curl, server-to-server, health checks
      if (!origin || isAllowedOrigin(origin)) return callback(null, true);
      warnOnce(origin);
      return callback(null, false); // no CORS headers -> the browser blocks the response
    },
    credentials: true, // allow the login cookie
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600, // browsers may cache the preflight answer for 10 minutes
  });

  // CORS only blocks reading responses, so also reject write requests from disallowed origins (CSRF guard)
  const blockForeignWrites = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const isWrite = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    if (isWrite && origin && !isAllowedOrigin(origin)) {
      warnOnce(origin);
      res.status(403).json({ message: "Requests from this website are not allowed" });
      return;
    }
    next();
  };

  return [corsHandler, blockForeignWrites];
};
