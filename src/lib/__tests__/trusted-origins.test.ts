import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const BASE_ENV = {
  DATABASE_URL: "mysql://user:pass@localhost:3306/test?sslaccept=strict",
  BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
  BETTER_AUTH_URL: "https://app.example.com",
  RESEND_API_KEY: "re_test_key",
  SURECART_WEBHOOK_SECRET: "surecart-webhook-secret-24ch",
  CRON_SECRET: "cron-secret-at-least-24-chars",
  NEXT_PUBLIC_APP_URL: "https://app.example.com",
  MAIL_FROM: "test@example.com",
};

function stubEnv(overrides: Record<string, string | undefined> = {}) {
  for (const [key, value] of Object.entries({ ...BASE_ENV, ...overrides })) {
    if (value === undefined) delete process.env[key];
    else vi.stubEnv(key, value);
  }
}

describe("buildTrustedOrigins", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("includes the public and auth base URLs", async () => {
    stubEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://app.example.com",
      BETTER_AUTH_URL: "https://app.example.com",
      VERCEL_URL: undefined,
    });

    const { buildTrustedOrigins } = await import("../trusted-origins");
    expect(buildTrustedOrigins()).toEqual([
      "https://app.example.com",
      "https://wellwith.katarina2.com",
    ]);
  });

  it("includes the Vercel deployment host when present", async () => {
    stubEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://app.example.com",
      BETTER_AUTH_URL: "https://app.example.com",
      VERCEL_URL: "preview-abc.vercel.app",
    });

    const { buildTrustedOrigins } = await import("../trusted-origins");
    expect(buildTrustedOrigins()).toEqual([
      "https://app.example.com",
      "https://wellwith.katarina2.com",
      "https://preview-abc.vercel.app",
    ]);
  });

  it("adds local development patterns", async () => {
    stubEnv({
      NODE_ENV: "development",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      BETTER_AUTH_URL: "http://localhost:3000",
      VERCEL_URL: undefined,
    });

    const { buildTrustedOrigins } = await import("../trusted-origins");
    expect(buildTrustedOrigins()).toEqual([
      "http://localhost:3000",
      "https://wellwith.katarina2.com",
      "http://localhost:*",
      "http://127.0.0.1:*",
      "http://192.168.*:*",
      "http://10.*:*",
    ]);
  });
});
