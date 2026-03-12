import { type ChildProcess, spawn } from "child_process";

let server: ChildProcess | undefined;

async function waitForServer(url: string, timeout: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} not ready after ${timeout}ms`);
}

export async function setup() {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  // Check if server is already running
  try {
    await fetch(baseUrl);
    return; // Already running
  } catch {
    // Need to start it
  }

  server = spawn("npx", ["next", "dev", "--port", "3000"], {
    cwd: process.cwd(),
    stdio: "pipe",
    env: { ...process.env },
    detached: false,
  });

  server.stderr?.on("data", () => {}); // drain stderr
  server.stdout?.on("data", () => {}); // drain stdout

  await waitForServer(baseUrl, 30000);
}

export async function teardown() {
  server?.kill("SIGTERM");
}
