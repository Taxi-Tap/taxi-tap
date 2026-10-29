import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, UserRound } from "lucide-react";
import { LoadingScreen } from "@/components/auth/loading-screen";
import { TwoFactorSetting } from "@/components/auth/two-factor-setting";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/server/auth";
import { getSignedInProfile } from "@/server/signup";

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const profile = await getSignedInProfile();
  if (!profile) redirect("/sign-in");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <main className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /> Home
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-6" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{session.user.email}</CardDescription>
              </div>
              <Badge variant="secondary" className="ml-auto capitalize">
                {profile.role.replaceAll("_", " ")}
              </Badge>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>Ask for a code sent to your email each time you sign in.</CardDescription>
          </CardHeader>
          <CardContent>
            <TwoFactorSetting enabled={Boolean(session.user.twoFactorEnabled)} />
          </CardContent>
        </Card>
        <SignOutButton />
      </div>
    </main>
  );
}
