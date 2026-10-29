import { describe, expect, it } from "vitest";
import {
  companyCodeSchema,
  normalizeCompanyCode,
  registerBusinessSchema,
  registerPersonalSchema,
  registerStaffSchema,
  validateSignInForm,
  validateWith,
  accountDetailsSchema,
  companyInfoSchema,
  passwordStepSchema,
} from "@/lib/auth-validation";

const account = { name: "Thandi", surname: "Nkosi", email: "Thandi@Example.test", phone: "082 123 4567" };
const passwords = { password: "password123", confirmPassword: "password123" };

describe("sign-up steps", () => {
  it("accepts a complete personal sign-up and lowercases the email", () => {
    const r = registerPersonalSchema.safeParse({ ...account, ...passwords });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("thandi@example.test");
  });

  it("requires the account fields", () => {
    const errors = validateWith(accountDetailsSchema, { name: "", surname: "", email: "nope", phone: "abc" });
    expect(errors.name).toBeTruthy();
    expect(errors.surname).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });

  it("allows an empty contact number", () => {
    expect(validateWith(accountDetailsSchema, { ...account, phone: "" })).toEqual({});
  });

  it("flags mismatched passwords", () => {
    const errors = validateWith(passwordStepSchema, { password: "password123", confirmPassword: "different123" });
    expect(errors.confirmPassword).toBe("Passwords do not match");
  });

  it("rejects short passwords", () => {
    expect(validateWith(passwordStepSchema, { password: "short", confirmPassword: "short" }).password).toBeTruthy();
  });
});

describe("company steps", () => {
  it("accepts a valid business sign-up", () => {
    const r = registerBusinessSchema.safeParse({
      ...account,
      ...passwords,
      companyName: "Rank A Taxis",
      slug: "rank-a-taxis",
      orgType: "business",
      location: "Durban",
    });
    expect(r.success).toBe(true);
  });

  it("only allows url-safe slugs", () => {
    expect(validateWith(companyInfoSchema, { companyName: "Rank A", slug: "Rank A!" }).slug).toBeTruthy();
    expect(validateWith(companyInfoSchema, { companyName: "Rank A", slug: "rank-a" })).toEqual({});
  });

  it("requires a business type and location", () => {
    const r = registerBusinessSchema.safeParse({ ...account, ...passwords, companyName: "Rank A", slug: "rank-a", orgType: "", location: "" });
    expect(r.success).toBe(false);
  });
});

describe("joining a company", () => {
  it("normalises company codes typed with dashes or lowercase", () => {
    expect(normalizeCompanyCode("abc-def-ghj")).toBe("ABCDEFGHJ");
    expect(companyCodeSchema.safeParse({ code: "abc-def-ghj" }).success).toBe(true);
  });

  it("rejects codes that are too short", () => {
    expect(validateWith(companyCodeSchema, { code: "ABC-DE" }).code).toBeTruthy();
  });

  it("only allows driver or merchant staff roles when joining", () => {
    const base = { ...account, ...passwords, code: "ABCDEFGHJ" };
    expect(registerStaffSchema.safeParse({ ...base, role: "driver" }).success).toBe(true);
    expect(registerStaffSchema.safeParse({ ...base, role: "merchant_staff" }).success).toBe(true);
    expect(registerStaffSchema.safeParse({ ...base, role: "owner" }).success).toBe(false);
  });
});

describe("sign-in form", () => {
  it("requires sign-in email and password", () => {
    const errors = validateSignInForm({ email: "", password: "" });
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });
});
