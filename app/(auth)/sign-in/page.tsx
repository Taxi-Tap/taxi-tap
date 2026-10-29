import { SignInForm } from "@/components/auth/sign-in-form";
import { googleEnabled } from "@/server/auth";

export default function SignInPage() {
  return <SignInForm googleEnabled={googleEnabled} />;
}
