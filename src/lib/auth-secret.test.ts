import assert from "node:assert/strict";
import test from "node:test";

test("production authentication refuses to sign sessions without AUTH_SECRET", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousAuthSecret = process.env.AUTH_SECRET;

  Object.assign(process.env, { NODE_ENV: "production" });
  delete process.env.AUTH_SECRET;

  try {
    const { createSession } = await import("./auth");
    await assert.rejects(
      () =>
        createSession({
          id: 1,
          name: "Security Test",
          email: "security@example.test",
          role: "admin",
        }),
      /AUTH_SECRET is required in production/
    );
  } finally {
    if (previousNodeEnv === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: previousNodeEnv });

    if (previousAuthSecret === undefined) Reflect.deleteProperty(process.env, "AUTH_SECRET");
    else process.env.AUTH_SECRET = previousAuthSecret;
  }
});
