import { NextFunction, Request, Response } from "express";

// Very small in-memory rate limiter (per IP, fixed window).
// Good enough for a single server instance; use a shared store (e.g. Redis) if you scale out.
export const rateLimit = ({ windowMs, max }: { windowMs: number; max: number }) => {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || "unknown";
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      // occasionally drop expired entries so the map does not grow forever
      if (hits.size > 10_000) {
        for (const [ip, value] of hits) if (value.resetAt <= now) hits.delete(ip);
      }
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      res.status(429).json({ message: "Too many requests, please try again in a minute." });
      return;
    }
    next();
  };
};
