import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Temporary screen used until the owner builds the real one. */
export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="mx-auto w-full max-w-md p-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
