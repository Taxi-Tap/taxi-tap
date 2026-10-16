"use server";

// TODO TAX-41: issue a signed QR token for the user's wallet that expires after 60 seconds; verify it on the server.
export async function createQrToken(): Promise<never> {
  throw new Error("Not implemented");
}
