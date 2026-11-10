import type { APIResponseType } from "../types/APIResponseType";
import { API_URL } from "./config";

export type ApiResult = { status: number; data: APIResponseType };

// generous, because a sleeping Render instance can take ~45s to wake up
const REQUEST_TIMEOUT_MS = 45_000;

// Readable text when the server sends no message (e.g. a 502 HTML page from the host)
const fallbackMessage = (status: number) => {
  if (status === 401) return "Please login to continue.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "That item could not be found.";
  if (status === 429) return "Too many requests. Please wait a minute and try again.";
  if (status >= 500) return "Something went wrong on the server. Please try again in a moment.";
  return "Request failed. Please try again.";
};

// Single fetch wrapper: sends the login cookie, JSON-encodes the body, and always returns a
// readable `message` (from the server's message/error, or a fallback). Network errors return status 0.
export async function apiRequest(path: string, method = "GET", body?: unknown): Promise<ApiResult> {
  // AbortController + timer works in every browser (AbortSignal.timeout is missing in older Safari)
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      signal: controller.signal,
      ...(body !== undefined && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
    const json = await res.json().catch(() => null);
    const data = json && typeof json === "object" ? json : {};
    const message = typeof data.message === "string" && data.message ? data.message
      : typeof data.error === "string" && data.error ? data.error
      : res.ok ? "" : fallbackMessage(res.status);
    return { status: res.status, data: { ...data, message } };
  } catch {
    return {
      status: 0,
      data: { message: timedOut ? "The server is taking too long to respond. Please try again." : "Could not reach the server. Check your connection and try again." },
    };
  } finally {
    clearTimeout(timer);
  }
}
