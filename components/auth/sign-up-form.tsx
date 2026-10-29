"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUpWithProfile } from "@/app/auth-actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { homeForRole } from "@/lib/role-routing";
import {
  signUpFormSchema,
  validateSignUpForm,
  type SignUpFormInput,
} from "@/lib/auth-validation";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<SignUpFormInput["role"] | "">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const input = { name, email, phone, role, password, confirmPassword };
    const validationErrors = validateSignUpForm(input);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    const parsed = signUpFormSchema.safeParse(input);
    if (!parsed.success) return;

    setBusy(true);
    try {
      const result = await signUpWithProfile(parsed.data);
      if (!result.ok) {
        const serverErrors: Record<string, string> = {};
        for (const [field, fieldMessages] of Object.entries(result.fieldErrors ?? {})) {
          if (fieldMessages?.[0]) serverErrors[field] = fieldMessages[0];
        }
        setErrors(serverErrors);
        setMessage(result.error);
        return;
      }
      router.replace(homeForRole(result.role));
      router.refresh();
    } catch {
      setMessage("We could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create account"
      description="Get started with a Taxi Tap account."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="name" label="Full name" error={errors.name}>
          <input id="name" name="name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} className={inputClassName} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClassName} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
        </FormField>
        <FormField id="phone" label="Phone (optional)" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClassName} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} />
        </FormField>
        <FormField id="role" label="I am a" error={errors.role}>
          <select
            id="role"
            name="role"
            required
            value={role}
            onChange={(event) =>
              setRole(
                (["customer", "driver", "owner", "merchant_staff"] as const).find(
                  (option) => option === event.target.value,
                ) ?? "",
              )
            }
            className={inputClassName}
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? "role-error" : undefined}
          >
            <option value="">Choose account type</option>
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="owner">Business owner</option>
            <option value="merchant_staff">Merchant staff</option>
          </select>
        </FormField>
        <FormField id="password" label="Password" error={errors.password}>
          <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClassName} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} />
        </FormField>
        <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClassName} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined} />
        </FormField>
        <p className="rounded-xl bg-purple-50 p-3 text-sm leading-5 text-purple-950">
          Taxi Tap is a prototype. All money shown in the app is simulated.
        </p>
        {message ? <p role="alert" className="text-sm font-medium text-red-700">{message}</p> : null}
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-black px-4 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-700">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[#6D28D9] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
