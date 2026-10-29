"use server";

import {
  findCompanyByCode,
  getSignedInProfile,
  registerBusiness,
  registerPersonal,
  registerStaff,
} from "@/server/signup";
import type {
  RegisterBusinessInput,
  RegisterPersonalInput,
  RegisterStaffInput,
} from "@/lib/auth-validation";

export async function getAuthProfile() {
  return getSignedInProfile();
}

export async function signUpPersonal(input: RegisterPersonalInput) {
  return registerPersonal(input);
}

export async function signUpBusiness(input: RegisterBusinessInput) {
  return registerBusiness(input);
}

export async function signUpStaff(input: RegisterStaffInput) {
  return registerStaff(input);
}

/** Company name for a code, or null. Lets the join screen confirm the company before asking for a role. */
export async function lookupCompanyCode(code: string) {
  const org = await findCompanyByCode(code);
  return org ? { name: org.name, type: org.type } : null;
}
