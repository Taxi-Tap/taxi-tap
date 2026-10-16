import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const screens = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/wallet", label: "Wallet (customer)" },
  { href: "/trip", label: "Trip (driver reader)" },
  { href: "/request", label: "Request payment (merchant)" },
  { href: "/dashboard", label: "Dashboard (owner)" },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md p-4">
      <Card>
        <CardHeader>
          <CardTitle>Taxi Tap</CardTitle>
          <CardDescription>
            One wallet for minibus taxi fares, service providers and informal traders.
          </CardDescription>
          <Badge variant="secondary">Simulated funds only</Badge>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {screens.map((s) => (
              <li key={s.href}>
                <Link className="underline underline-offset-4" href={s.href}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
