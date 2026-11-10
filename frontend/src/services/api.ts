import type { APIResponseType } from "../types/APIResponseType";

export type ApiResult = { status: number; data: APIResponseType };

// Single fetch wrapper: sends the login cookie, JSON-encodes the body; network errors return status 0
export async function apiRequest(path: string, method = "GET", body?: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      method,
      credentials: "include",
      ...(body !== undefined && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
    const data = await res.json().catch(() => ({ message: res.statusText || "Unexpected server response" }));
    return { status: res.status, data };
  } catch {
    return { status: 0, data: { message: "Could not reach the server. Please try again." } };
  }
}
