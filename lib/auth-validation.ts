import { z } from "zod";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth-schemas";

export const signUpFormSchema = signUpSchema
  .extend({
    phone: z.string().trim().max(30, "Phone number is too long").optional(),
    role: z.enum(["customer", "driver", "owner", "merchant_staff"], {
      error: "Choose an account type",
    }),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormInput = z.input<typeof signUpFormSchema>;

function errorsFrom(result: { success: false; error: z.ZodError }) {
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function validateSignInForm(input: unknown): Record<string, string> {
  const result = signInSchema.safeParse(input);
  return result.success ? {} : errorsFrom(result);
}

export function validateSignUpForm(input: unknown): Record<string, string> {
  const result = signUpFormSchema.safeParse(input);
  return result.success ? {} : errorsFrom(result);
}

export function validateResetPasswordForm(
  input: unknown,
): Record<string, string> {
  const result = resetPasswordSchema
    .extend({ confirmPassword: z.string() })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .safeParse(input);
  return result.success ? {} : errorsFrom(result);
}

export function validateEmailForm(input: unknown): Record<string, string> {
  const result = requestPasswordResetSchema.safeParse(input);
  return result.success ? {} : errorsFrom(result);
}
