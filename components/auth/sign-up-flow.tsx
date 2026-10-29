"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Building2, Check, Copy, ImageUp, Loader2, UsersRound } from "lucide-react";
import { lookupCompanyCode, signUpBusiness, signUpPersonal, signUpStaff } from "@/app/auth-actions";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Field, inputClass, primaryButtonClass } from "@/components/auth/field";
import { LoadingScreen } from "@/components/auth/loading-screen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  accountDetailsSchema,
  companyCodeSchema,
  companyInfoSchema,
  companyTypeSchema,
  ORG_TYPE_LABELS,
  passwordStepSchema,
  staffRoleSchema,
  validateWith,
} from "@/lib/auth-validation";
import { fileToLogoDataUrl } from "@/lib/image";
import { homeForRole, type AppRole } from "@/lib/role-routing";
import { cn } from "@/lib/utils";

type Mode = "personal" | "business";
type Step =
  | "account"
  | "choice"
  | "company-info"
  | "company-type"
  | "company-code"
  | "job-role"
  | "password"
  | "company-created";

type OrgType = keyof typeof ORG_TYPE_LABELS;
type StaffRole = "driver" | "merchant_staff";

const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  driver: "Driver",
  merchant_staff: "Merchant",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function formatCompanyCode(code: string) {
  return code.replace(/(.{3})(?=.)/g, "$1-");
}

/** One choice row from the "Join or create" / "Job role" designs. */
function ChoiceRow({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <Label
      htmlFor={`choice-${value}`}
      className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-base has-[[data-checked]]:border-foreground has-[[data-checked]]:ring-1 has-[[data-checked]]:ring-foreground"
    >
      <span>
        {label}
        {hint ? <span className="block text-sm font-normal text-muted-foreground">{hint}</span> : null}
      </span>
      <RadioGroupItem id={`choice-${value}`} value={value} />
    </Label>
  );
}

export function SignUpFlow({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const mode = initialMode;

  const [step, setStep] = useState<Step>("account");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Collected across steps; nothing is sent to the server until the password step.
  const [account, setAccount] = useState({ name: "", surname: "", email: "", phone: "" });
  const [choice, setChoice] = useState<"create" | "join" | "">("");
  const [company, setCompany] = useState({ companyName: "", slug: "", logo: "" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [companyType, setCompanyType] = useState<{ orgType: OrgType | ""; location: string }>({ orgType: "", location: "" });
  const [code, setCode] = useState("");
  const [joinedCompany, setJoinedCompany] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole | "">("");
  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
  const [created, setCreated] = useState<{ role: AppRole; joinCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  const flow: Step[] =
    mode === "personal"
      ? ["account", "password"]
      : choice === "join"
        ? ["account", "choice", "company-code", "job-role", "password"]
        : ["account", "choice", "company-info", "company-type", "password"];
  const index = flow.indexOf(step);
  // Business designs show four bars; personal uses one bar per step.
  const totalSteps = mode === "personal" ? 2 : 4;
  const barStep = mode === "personal" ? index + 1 : Math.min(index + 1, 4);

  function go(next: Step) {
    setErrors({});
    setMessage("");
    setStep(next);
  }
  function back() {
    if (index <= 0) router.push("/");
    else go(flow[index - 1]);
  }
  function check(schema: Parameters<typeof validateWith>[0], input: unknown) {
    const found = validateWith(schema, input);
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function submitAccount(e: FormEvent) {
    e.preventDefault();
    if (!check(accountDetailsSchema, account)) return;
    go(mode === "personal" ? "password" : "choice");
  }

  function submitChoice(e: FormEvent) {
    e.preventDefault();
    if (!choice) return setErrors({ choice: "Choose one to continue" });
    go(choice === "create" ? "company-info" : "company-code");
  }

  async function pickLogo(file: File | undefined) {
    if (!file) return;
    try {
      const logo = await fileToLogoDataUrl(file);
      setCompany((c) => ({ ...c, logo }));
      setErrors((er) => ({ ...er, logo: "" }));
    } catch {
      setErrors((er) => ({ ...er, logo: "Choose an image we can read (PNG or JPG)" }));
    }
  }

  function submitCompanyInfo(e: FormEvent) {
    e.preventDefault();
    if (!check(companyInfoSchema, company)) return;
    go("company-type");
  }

  function submitCompanyType(e: FormEvent) {
    e.preventDefault();
    if (!check(companyTypeSchema, companyType)) return;
    go("password");
  }

  async function submitCompanyCode(e: FormEvent) {
    e.preventDefault();
    if (!check(companyCodeSchema, { code })) return;
    setBusy(true);
    try {
      const found = await lookupCompanyCode(code);
      if (!found) {
        setErrors({ code: "We could not find a company with that code" });
        return;
      }
      setJoinedCompany(found.name);
      go("job-role");
    } catch {
      setMessage("We could not check that code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function submitJobRole(e: FormEvent) {
    e.preventDefault();
    if (!check(staffRoleSchema, { role: staffRole })) return;
    go("password");
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    if (!check(passwordStepSchema, passwords)) return;
    setBusy(true);
    setMessage("");
    try {
      const base = { ...account, ...passwords };
      const result =
        mode === "personal"
          ? await signUpPersonal(base)
          : choice === "join"
            ? await signUpStaff({ ...base, code, role: staffRole as StaffRole })
            : await signUpBusiness({ ...base, ...company, orgType: companyType.orgType as OrgType, location: companyType.location });
      if (!result.ok) {
        const fieldErrors: Record<string, string> = {};
        for (const [field, msgs] of Object.entries(result.fieldErrors ?? {})) {
          if (msgs?.[0]) fieldErrors[field] = msgs[0];
        }
        // Send the user back to the step that owns the failing field.
        if (fieldErrors.slug) return go("company-info"), setErrors(fieldErrors);
        if (fieldErrors.code) return go("company-code"), setErrors(fieldErrors);
        if (fieldErrors.role) return go("job-role"), setErrors(fieldErrors);
        if (fieldErrors.email || fieldErrors.name || fieldErrors.surname || fieldErrors.phone) {
          return go("account"), setErrors(fieldErrors);
        }
        setMessage(result.error);
        return;
      }
      if (result.needsVerification) {
        router.replace(`/verify?email=${encodeURIComponent(result.email)}`);
        return;
      }
      if (result.joinCode) {
        setCreated({ role: result.role, joinCode: result.joinCode });
        go("company-created");
        router.refresh();
        return;
      }
      setRedirecting(true);
      router.replace(homeForRole(result.role));
      router.refresh();
    } catch {
      setMessage("We could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (redirecting) return <LoadingScreen label="Creating your account…" />;

  const signInFooter = (
    <p>
      Already have an account?{" "}
      <Link href="/sign-in" className="font-semibold underline underline-offset-4">
        Sign in
      </Link>
    </p>
  );
  const continueButton = (label = "Continue", loading = false) => (
    <div className="mt-auto pt-8">
      <Button type="submit" disabled={busy} className={primaryButtonClass}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {label}
      </Button>
    </div>
  );
  const barTitle = "Create account";
  const errorAlert = message ? (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null;

  if (step === "account") {
    return (
      <AuthScreen
        barTitle={barTitle}
        title="Create account"
        description={mode === "business" ? "Tell us about yourself, then set up or join your company." : "Enter your details to get started with Taxi Tap."}
        step={barStep}
        totalSteps={totalSteps}
        onBack={back}
        footer={signInFooter}
      >
        <form onSubmit={submitAccount} noValidate className="flex flex-1 flex-col gap-5">
          <Field id="name" label="Name" error={errors.name}>
            <Input id="name" autoComplete="given-name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} className={inputClass} />
          </Field>
          <Field id="surname" label="Surname" error={errors.surname}>
            <Input id="surname" autoComplete="family-name" value={account.surname} onChange={(e) => setAccount({ ...account, surname: e.target.value })} aria-invalid={Boolean(errors.surname)} aria-describedby={errors.surname ? "surname-error" : undefined} className={inputClass} />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <Input id="email" type="email" autoComplete="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={inputClass} />
          </Field>
          <Field id="phone" label="Contact number" error={errors.phone}>
            <Input id="phone" type="tel" autoComplete="tel" value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} className={inputClass} />
          </Field>
          {continueButton()}
        </form>
      </AuthScreen>
    );
  }

  if (step === "choice") {
    return (
      <AuthScreen barTitle="Join or create" title="Join or create" description="Select if you are joining a business or creating your own." step={barStep} totalSteps={totalSteps} onBack={back}>
        <form onSubmit={submitChoice} noValidate className="flex flex-1 flex-col gap-4">
          <RadioGroup value={choice} onValueChange={(v) => setChoice(v as "create" | "join")} aria-label="Join or create">
            <ChoiceRow value="create" label="Create a company account" />
            <ChoiceRow value="join" label="Join an existing company" />
          </RadioGroup>
          {errors.choice ? <p role="alert" className="text-sm font-medium text-destructive">{errors.choice}</p> : null}
          {continueButton()}
        </form>
      </AuthScreen>
    );
  }

  if (step === "company-info") {
    return (
      <AuthScreen barTitle="Create account" title="Company info" description="Tell us the name your drivers and staff will recognise." step={barStep} totalSteps={totalSteps} onBack={back}>
        <form onSubmit={submitCompanyInfo} noValidate className="flex flex-1 flex-col gap-5">
          <Field id="logo" label="Logo (optional)" error={errors.logo}>
            <input ref={logoInput} id="logo" type="file" accept="image/*" className="sr-only" onChange={(e) => pickLogo(e.target.files?.[0])} />
            <button
              type="button"
              onClick={() => logoInput.current?.click()}
              aria-label={company.logo ? "Change logo" : "Upload logo"}
              className="flex size-20 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            >
              {company.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- small data URL chosen by the user
                <img src={company.logo} alt="Company logo preview" className="size-full object-cover" />
              ) : (
                <ImageUp className="size-6 text-muted-foreground" aria-hidden="true" />
              )}
            </button>
          </Field>
          <Field id="companyName" label="Company name" error={errors.companyName}>
            <Input
              id="companyName"
              autoComplete="organization"
              value={company.companyName}
              onChange={(e) => {
                const companyName = e.target.value;
                setCompany((c) => ({ ...c, companyName, slug: slugEdited ? c.slug : slugify(companyName) }));
              }}
              aria-invalid={Boolean(errors.companyName)}
              aria-describedby={errors.companyName ? "companyName-error" : undefined}
              className={inputClass}
            />
          </Field>
          <Field id="slug" label="Slug name" error={errors.slug} hint="Your company's short name, e.g. rank-a-taxis.">
            <Input
              id="slug"
              autoCapitalize="none"
              value={company.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setCompany((c) => ({ ...c, slug: e.target.value.toLowerCase() }));
              }}
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={errors.slug ? "slug-error" : undefined}
              className={inputClass}
            />
          </Field>
          {continueButton()}
        </form>
      </AuthScreen>
    );
  }

  if (step === "company-type") {
    return (
      <AuthScreen barTitle="Create account" title="Company type" description="This decides which tools your team sees." step={barStep} totalSteps={totalSteps} onBack={back}>
        <form onSubmit={submitCompanyType} noValidate className="flex flex-1 flex-col gap-5">
          <Field id="orgType" label="Business type" error={errors.orgType}>
            <Select value={companyType.orgType} onValueChange={(v) => setCompanyType((t) => ({ ...t, orgType: v as OrgType }))}>
              <SelectTrigger id="orgType" aria-invalid={Boolean(errors.orgType)} className="h-12 w-full rounded-lg px-3 text-base">
                <SelectValue placeholder="Choose a business type">
                  {(v: string) => ORG_TYPE_LABELS[v as OrgType] ?? "Choose a business type"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ORG_TYPE_LABELS) as OrgType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {ORG_TYPE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="location" label="Location" error={errors.location}>
            <Input id="location" autoComplete="address-level2" value={companyType.location} onChange={(e) => setCompanyType((t) => ({ ...t, location: e.target.value }))} aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? "location-error" : undefined} className={inputClass} />
          </Field>
          {continueButton("Continue")}
        </form>
      </AuthScreen>
    );
  }

  if (step === "company-code") {
    return (
      <AuthScreen barTitle="Join or create" title="Company code" description="Enter the company code to be accepted to the team." step={barStep} totalSteps={totalSteps} onBack={back}
        footer={<p>Don&apos;t have the code? Ask the company owner or admin.</p>}
      >
        <form onSubmit={submitCompanyCode} noValidate className="flex flex-1 flex-col gap-5">
          <Field id="code" label="Company code" error={errors.code}>
            <InputOTP id="code" maxLength={9} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} value={code} onChange={(v) => setCode(v.toUpperCase())} aria-invalid={Boolean(errors.code)} containerClassName="gap-2">
              <InputOTPGroup>
                <InputOTPSlot index={0} className="size-11" />
                <InputOTPSlot index={1} className="size-11" />
                <InputOTPSlot index={2} className="size-11" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="size-11" />
                <InputOTPSlot index={4} className="size-11" />
                <InputOTPSlot index={5} className="size-11" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={6} className="size-11" />
                <InputOTPSlot index={7} className="size-11" />
                <InputOTPSlot index={8} className="size-11" />
              </InputOTPGroup>
            </InputOTP>
          </Field>
          {errorAlert}
          {continueButton("Verify", busy)}
        </form>
      </AuthScreen>
    );
  }

  if (step === "job-role") {
    return (
      <AuthScreen barTitle="Role" title="Job role" description={`Select the role you were assigned to at ${joinedCompany || "the company"}.`} step={barStep} totalSteps={totalSteps} onBack={back}>
        <form onSubmit={submitJobRole} noValidate className="flex flex-1 flex-col gap-4">
          <RadioGroup value={staffRole} onValueChange={(v) => setStaffRole(v as StaffRole)} aria-label="Job role">
            {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((r) => (
              <ChoiceRow key={r} value={r} label={STAFF_ROLE_LABELS[r]} />
            ))}
          </RadioGroup>
          {errors.role ? <p role="alert" className="text-sm font-medium text-destructive">{errors.role}</p> : null}
          {continueButton()}
        </form>
      </AuthScreen>
    );
  }

  if (step === "company-created" && created) {
    const formatted = formatCompanyCode(created.joinCode);
    return (
      <AuthScreen barTitle="All set" title="Company created" description="Share this code with your drivers and staff so they can join your company." hideBack>
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Company code</p>
              <p className="font-mono text-2xl font-bold tracking-widest" aria-label={`Company code ${created.joinCode.split("").join(" ")}`}>
                {formatted}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Copy company code"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(formatted);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
          <div className="mt-auto pt-8">
            <Button type="button" className={primaryButtonClass} onClick={() => { setRedirecting(true); router.replace(homeForRole(created.role)); router.refresh(); }}>
              Go to my dashboard
            </Button>
          </div>
        </div>
      </AuthScreen>
    );
  }

  // password
  return (
    <AuthScreen barTitle="Create account" title="Create password" description="Choose a password you will remember. You will use it to sign in." step={barStep} totalSteps={totalSteps} onBack={back}>
      <form onSubmit={submitPassword} noValidate className="flex flex-1 flex-col gap-5">
        <Field id="password" label="Password" error={errors.password} hint="At least 8 characters.">
          <Input id="password" type="password" autoComplete="new-password" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className={inputClass} />
        </Field>
        <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined} className={inputClass} />
        </Field>
        <div className={cn("flex items-start gap-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground")}>
          {mode === "business" ? <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <UsersRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
          <p>Taxi Tap is a prototype. All money shown in the app is simulated.</p>
        </div>
        {errorAlert}
        {continueButton("Create account", busy)}
      </form>
    </AuthScreen>
  );
}
