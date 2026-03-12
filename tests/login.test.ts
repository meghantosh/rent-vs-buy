import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { type ChildProcess, spawn } from "child_process";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "testpassword123";
const TEST_NAME = "Vitest User";

let server: ChildProcess | undefined;

async function waitForServer(url: string, timeout: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Server at ${url} not ready after ${timeout}ms`);
}

/** Extract all Set-Cookie values from a response */
function getSetCookies(res: Response): string[] {
  const raw = res.headers.getSetCookie?.();
  if (raw && raw.length > 0) return raw;
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

/** Build a Cookie header string from Set-Cookie values */
function cookieHeader(setCookies: string[]): string {
  return setCookies
    .map((c) => c.split(";")[0])
    .join("; ");
}

beforeAll(async () => {
  if (process.env.TEST_BASE_URL) return;

  try {
    await fetch(BASE_URL);
    return;
  } catch {
    // Start server
  }

  const projectRoot = new URL("..", import.meta.url).pathname;
  server = spawn("npx", ["next", "dev", "--port", "3000"], {
    cwd: projectRoot,
    stdio: "pipe",
  });
  server.stderr?.on("data", () => {});
  server.stdout?.on("data", () => {});

  await waitForServer(BASE_URL, 30000);
}, 35000);

afterAll(() => {
  server?.kill("SIGTERM");
});

describe("auth flow", () => {
  it("registers a new user and signs in with credentials", async () => {
    // 1. Register
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    if (registerRes.status !== 201) {
      const body = await registerRes.text();
      throw new Error(`Register failed with ${registerRes.status}: ${body}`);
    }

    const user = await registerRes.json();
    expect(user.email).toBe(TEST_EMAIL);
    expect(user.name).toBe(TEST_NAME);

    // 2. Get CSRF token (and its cookie)
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const { csrfToken } = await csrfRes.json();
    const csrfCookies = getSetCookies(csrfRes);

    // 3. Sign in via NextAuth credentials endpoint, forwarding CSRF cookie
    const signInRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookieHeader(csrfCookies),
      },
      body: new URLSearchParams({
        csrfToken,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
      redirect: "manual",
    });

    expect(signInRes.status).toBe(302);

    // 4. Collect session cookies from sign-in response
    const signInCookies = getSetCookies(signInRes);
    const allCookies = [...csrfCookies, ...signInCookies];
    const sessionCookie = allCookies.find((c) =>
      c.includes("authjs.session-token") && !c.includes("authjs.session-token=;")
    );
    expect(sessionCookie).toBeTruthy();

    // 5. Verify session is valid
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { Cookie: cookieHeader(allCookies) },
    });
    const session = await sessionRes.json();
    expect(session.user.email).toBe(TEST_EMAIL);

    // 6. Duplicate registration fails
    const dupeRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });
    expect(dupeRes.status).toBe(409);

    // 7. Wrong password fails
    const badCsrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const { csrfToken: badCsrf } = await badCsrfRes.json();
    const badCsrfCookies = getSetCookies(badCsrfRes);

    const badSignInRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookieHeader(badCsrfCookies),
      },
      body: new URLSearchParams({
        csrfToken: badCsrf,
        email: TEST_EMAIL,
        password: "wrongpassword",
      }),
      redirect: "manual",
    });

    const badSignInCookies = getSetCookies(badSignInRes);
    const hasValidSession = badSignInCookies.some(
      (c) => c.includes("authjs.session-token") && !c.includes("authjs.session-token=;")
    );
    expect(hasValidSession).toBe(false);
  });
});
