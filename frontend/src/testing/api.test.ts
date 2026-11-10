jest.mock("../services/config", () => ({ API_URL: "http://api.test" }));

import { apiRequest } from "../services/api";

const respond = (status: number, body: unknown, isJson = true) =>
  (global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: isJson ? () => Promise.resolve(body) : () => Promise.reject(new SyntaxError("Unexpected token <")),
  }) as unknown as typeof fetch);

describe("apiRequest", () => {
  it("passes through the server's message", async () => {
    respond(400, { message: "Invalid book id" });
    expect(await apiRequest("/x")).toEqual({ status: 400, data: { message: "Invalid book id" } });
  });

  it("uses `error` when a 500 response has no `message`", async () => {
    respond(500, { success: false, error: "Internal Server Error" });
    const res = await apiRequest("/x");
    expect(res.status).toBe(500);
    expect(res.data.message).toBe("Internal Server Error");
  });

  it("gives a readable message for a non-JSON error page (e.g. 502 from the host)", async () => {
    respond(502, null, false);
    const res = await apiRequest("/x");
    expect(res.status).toBe(502);
    expect(res.data.message).toMatch(/something went wrong on the server/i);
  });

  it("gives a readable message for an empty 500 body", async () => {
    respond(500, {});
    expect((await apiRequest("/x")).data.message).toMatch(/something went wrong on the server/i);
  });

  it("reports network errors as status 0 with a message", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch")) as unknown as typeof fetch;
    const res = await apiRequest("/x");
    expect(res.status).toBe(0);
    expect(res.data.message).toMatch(/could not reach the server/i);
  });

  it("gives up after 45s with a 'too long' message", async () => {
    jest.useFakeTimers();
    // a fetch that only ends when the request is aborted
    global.fetch = jest.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    })) as unknown as typeof fetch;
    const pending = apiRequest("/x");
    jest.advanceTimersByTime(45_000);
    const res = await pending;
    jest.useRealTimers();
    expect(res.status).toBe(0);
    expect(res.data.message).toMatch(/taking too long/i);
  });

  it("keeps the payload on success and sends cookies + JSON body", async () => {
    respond(200, { message: "ok", payload: [1, 2] });
    const res = await apiRequest("/books", "POST", { a: 1 });
    expect(res.data).toEqual({ message: "ok", payload: [1, 2] });
    expect(global.fetch).toHaveBeenCalledWith("http://api.test/books", expect.objectContaining({
      method: "POST", credentials: "include", body: JSON.stringify({ a: 1 }),
    }));
  });
});
