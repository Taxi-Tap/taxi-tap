import { z } from "zod";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  signInSchema,
} from "@/lib/auth-schemas";

// Field rules for the screens in app/(auth). The same schemas run in the browser
// (to show errors next to fields) and on the server (server/signup.ts).

const email = z.email("Enter a valid email address").transform((e) => e.toLowerCase());

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

/** "Create account" step: name, surname, email, contact number. */
export const accountDetailsSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(60),
  surname: z.string().trim().min(1, "Enter your surname").max(60),
  email,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid contact number")
    .or(z.literal(""))
    .optional(),
});

/** "Create password" step. */
export const passwordStepSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const companyInfoSchema = z.object({
  companyName: z.string().trim().min(2, "Enter the company name").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")
    .min(3, "At least 3 characters")
    .max(40, "At most 40 characters"),
  /** Small image as a data URL (resized in the browser). Optional. */
  logo: z.string().max(150_000, "Logo is too large").optional(),
});

export const ORG_TYPE_LABELS = {
  association: "Taxi association",
  business: "Taxi owner business",
  merchant: "Merchant or trader",
} as const;

export const companyTypeSchema = z.object({
  orgType: z.enum(["association", "business", "merchant"], {
    error: "Choose a business type",
  }),
  location: z.string().trim().min(2, "Enter where you operate").max(120),
});

/** Company codes look like ABC-DEF-GHI; only the 9 letters/digits matter. */
export function normalizeCompanyCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
export const companyCodeSchema = z.object({
  code: z
    .string()
    .transform(normalizeCompanyCode)
    .pipe(z.string().length(9, "Enter all 9 characters of the company code")),
});

export const STAFF_ROLES = ["driver", "merchant_staff"] as const;
export const staffRoleSchema = z.object({
  role: z.enum(STAFF_ROLES, { error: "Choose your job role" }),
});

export const registerPersonalSchema = accountDetailsSchema.and(passwordStepSchema);

export const registerBusinessSchema = accountDetailsSchema
  .and(companyInfoSchema)
  .and(companyTypeSchema)
  .and(passwordStepSchema);

export const registerStaffSchema = accountDetailsSchema
  .and(companyCodeSchema)
  .and(staffRoleSchema)
  .and(passwordStepSchema);

export type AccountDetailsInput = z.input<typeof accountDetailsSchema>;
export type RegisterPersonalInput = z.input<typeof registerPersonalSchema>;
export type RegisterBusinessInput = z.input<typeof registerBusinessSchema>;
export type RegisterStaffInput = z.input<typeof registerStaffSchema>;

/** Flat { field: first message } map so forms can show one error under each field. */
export function validateWith(schema: z.ZodType, input: unknown): Record<string, string> {
  const result = schema.safeParse(input);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const validateSignInForm = (input: unknown) => validateWith(signInSchema, input);
export const validateEmailForm = (input: unknown) => validateWith(requestPasswordResetSchema, input);
export const validateResetPasswordForm = (input: unknown) =>
  validateWith(
    resetPasswordSchema
      .extend({ confirmPassword: z.string() })
      .refine((v) => v.newPassword === v.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
    input,
  );
