import { describe, expect, it } from "vitest";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth-schemas";

describe("signUpSchema", () => {
  it("accepts a valid sign-up and normalises the email", () => {
    const r = signUpSchema.safeParse({ name: "  Thandi ", email: "Thandi@Example.COM", password: "longenough1" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Thandi");
      expect(r.data.email).toBe("thandi@example.com");
    }
  });

  it("rejects short passwords, bad emails and empty names", () => {
    expect(signUpSchema.safeParse({ name: "A", email: "a@b.co", password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "A", email: "not-an-email", password: "longenough1" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "   ", email: "a@b.co", password: "longenough1" }).success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts an email and any non-empty password", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });

  it("rejects a missing password or bad email", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
});

describe("signInSchema rememberMe", () => {
  it("passes the Remember me checkbox through", () => {
    const r = signInSchema.safeParse({ email: "a@b.co", password: "x", rememberMe: true });
    expect(r.success && r.data.rememberMe).toBe(true);
  });
});

describe("requestPasswordResetSchema", () => {
  it("needs a valid email", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    expect(requestPasswordResetSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("needs a token and a long enough new password", () => {
    expect(resetPasswordSchema.safeParse({ token: "abc", newPassword: "longenough1" }).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ token: "", newPassword: "longenough1" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "abc", newPassword: "short" }).success).toBe(false);
  });
});
