// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const { createSession } = await import("@/lib/auth");

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  test("sets a cookie with the correct name", async () => {
    await createSession("user-1", "test@example.com");

    expect(mockCookieStore.set).toHaveBeenCalledOnce();
    expect(mockCookieStore.set.mock.calls[0][0]).toBe("auth-token");
  });

  test("generates a valid JWT token", async () => {
    await createSession("user-1", "test@example.com");

    const token = mockCookieStore.set.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    expect(payload.userId).toBe("user-1");
    expect(payload.email).toBe("test@example.com");
  });

  test("sets expiration to 7 days from now", async () => {
    const now = new Date("2025-01-15T00:00:00Z");
    vi.setSystemTime(now);

    await createSession("user-1", "test@example.com");

    const options = mockCookieStore.set.mock.calls[0][2];
    const expectedExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    expect(options.expires.getTime()).toBe(expectedExpiry.getTime());
  });

  test("includes expiresAt in the JWT payload", async () => {
    const now = new Date("2025-01-15T00:00:00Z");
    vi.setSystemTime(now);

    await createSession("user-1", "test@example.com");

    const token = mockCookieStore.set.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    expect(payload.expiresAt).toBeDefined();
  });

  test("sets cookie with httpOnly flag", async () => {
    await createSession("user-1", "test@example.com");

    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.httpOnly).toBe(true);
  });

  test("sets cookie with lax sameSite policy", async () => {
    await createSession("user-1", "test@example.com");

    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.sameSite).toBe("lax");
  });

  test("sets cookie path to root", async () => {
    await createSession("user-1", "test@example.com");

    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.path).toBe("/");
  });

  test("sets secure flag based on NODE_ENV", async () => {
    await createSession("user-1", "test@example.com");

    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.secure).toBe(process.env.NODE_ENV === "production");
  });

  test("signs JWT with HS256 algorithm", async () => {
    await createSession("user-1", "test@example.com");

    const token = mockCookieStore.set.mock.calls[0][1];
    const { protectedHeader } = await jwtVerify(token, JWT_SECRET);

    expect(protectedHeader.alg).toBe("HS256");
  });
});
