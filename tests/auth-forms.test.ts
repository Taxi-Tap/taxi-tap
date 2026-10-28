import { describe, expect, it } from "vitest";
import {
  validateSignInForm,
  validateSignUpForm,
} from "@/lib/auth-validation";

describe("auth form validation", () => {
  it("accepts a complete sign-up with matching passwords", () => {
    expect(
      validateSignUpForm({
        name: "Thandi",
        email: "thandi@example.test",
        phone: "",
        role: "customer",
        password: "password123",
        confirmPassword: "password123",
      }),
    ).toEqual({});
  });

  it("requires sign-up fields", () => {
    const errors = validateSignUpForm({
      name: "",
      email: "",
      role: "",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.role).toBeTruthy();
  });

  it("flags mismatched passwords", () => {
    const errors = validateSignUpForm({
      name: "Thandi",
      email: "thandi@example.test",
      role: "customer",
      password: "password123",
      confirmPassword: "different123",
    });
    expect(errors.confirmPassword).toBe("Passwords do not match");
  });

  it("requires sign-in email and password", () => {
    const errors = validateSignInForm({ email: "", password: "" });
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });
});
