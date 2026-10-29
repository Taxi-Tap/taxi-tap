"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BusFront, Copy, Ellipsis, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createVehicle } from "@/server/company";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SampleBadge } from "@/components/owner/sample-badge";
import type { TeamEntry, TeamKind } from "@/lib/owner-mock";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | TeamKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "driver", label: "Drivers" },
  { id: "vehicle", label: "Vehicles" },
  { id: "stall", label: "Stalls" },
  { id: "staff", label: "Staff" },
];

const LOOK = {
  driver: { icon: UserRound, bg: "bg-yellow-300" },
  vehicle: { icon: BusFront, bg: "bg-orange-400" },
  stall: { icon: Store, bg: "bg-purple-300" },
  staff: { icon: UserRound, bg: "bg-purple-300" },
} as const;

function groupCode(code: string) {
  return code.replace(/(.{3})(?=.)/g, "$1-");
}

export function TeamList({ team, joinCode }: { team: TeamEntry[]; joinCode: string | null }) {
  const [filter, setFilter] = useState<"all" | TeamKind>("all");
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [addingCar, setAddingCar] = useState(false);
  const [car, setCar] = useState({ registration: "", model: "Toyota Quantum", seats: "15" });
  const [carError, setCarError] = useState("");
  const [carBusy, setCarBusy] = useState(false);

  async function saveCar() {
    setCarError("");
    setCarBusy(true);
    try {
      const r = await createVehicle({ registration: car.registration, model: car.model, seats: Number(car.seats) });
      if (!r.ok) return setCarError(r.error);
      toast.success("Vehicle added");
      setAddingCar(false);
      setCar({ registration: "", model: "Toyota Quantum", seats: "15" });
      router.refresh();
    } finally {
      setCarBusy(false);
    }
  }
  const shown = useMemo(() => team.filter((t) => filter === "all" || t.kind === filter), [team, filter]);

  return (
    <div className="px-4 pt-4">
      <div role="group" aria-label="Filter team" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold",
              filter === f.id ? "border-fuchsia-600 bg-fuchsia-600 text-white" : "border-foreground bg-background",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-2.5">
        {shown.map((t) => {
          const { icon: Icon, bg } = LOOK[t.kind];
          return (
            <li key={t.id}>
              <Link href={`/team/${t.id}`} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", bg)}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 truncate text-base font-bold">
                    {t.name} {t.sample ? <SampleBadge /> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{t.detail}</span>
                </span>
                <Ellipsis className="size-5" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
        {shown.length === 0 ? <li className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Nobody here yet.</li> : null}
      </ul>

      <div className="sticky bottom-20 mt-6 bg-background pb-2 pt-2">
        <Button onClick={() => setAdding(true)} className="h-12 w-full rounded-full text-base font-semibold">
          Add to team
        </Button>
        <Button onClick={() => setAddingCar(true)} variant="outline" className="mt-2 h-11 w-full rounded-full font-semibold">
          Add vehicle
        </Button>
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to team</DialogTitle>
            <DialogDescription>
              Give new drivers and staff your company code. They enter it when they create their account and join your team.
            </DialogDescription>
          </DialogHeader>
          {joinCode ? (
            <p className="rounded-lg bg-muted p-4 text-center font-mono text-2xl font-bold tracking-widest" aria-label={`Company code ${joinCode.split("").join(" ")}`}>
              {groupCode(joinCode)}
            </p>
          ) : (
            <p className="rounded-lg bg-muted p-4 text-sm">You do not have a company code yet.</p>
          )}
          <DialogFooter>
            {joinCode ? (
              <Button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(groupCode(joinCode));
                    toast.success("Company code copied");
                  } catch {
                    toast.error("Could not copy. Select the code and copy it.");
                  }
                }}
              >
                <Copy /> Copy code
              </Button>
            ) : null}
            <Button type="button" variant="outline" render={<Link href="/company" />} nativeButton={false}>
              Company profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={addingCar} onOpenChange={setAddingCar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add vehicle</DialogTitle>
            <DialogDescription>Drivers pick from your vehicles when they start a shift.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reg">Number plate</Label>
              <Input id="reg" value={car.registration} onChange={(e) => setCar({ ...car, registration: e.target.value })} placeholder="ND 41 QZ ZN" autoCapitalize="characters" />
            </div>
            <div className="grid grid-cols-[1fr_6rem] gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={car.model} onChange={(e) => setCar({ ...car, model: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seats">Seats</Label>
                <Input id="seats" inputMode="numeric" value={car.seats} onChange={(e) => setCar({ ...car, seats: e.target.value.replace(/D/g, "") })} />
              </div>
            </div>
            {carError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {carError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" onClick={saveCar} disabled={carBusy || !car.registration.trim()}>
              Add vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
