"use server";

import {
  createAccountWithProfile,
  getSignedInProfile,
} from "@/server/signup";
import type { SignUpFormInput } from "@/lib/auth-validation";

export async function getAuthProfile() {
  return getSignedInProfile();
}

export async function signUpWithProfile(input: SignUpFormInput) {
  return createAccountWithProfile(input);
}
