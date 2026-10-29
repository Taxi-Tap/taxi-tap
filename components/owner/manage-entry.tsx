"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeMember } from "@/server/organisations";
import { removeStall, removeVehicle, updateStall, updateVehicle } from "@/server/fleet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeamDetail } from "@/lib/owner-types";

/** Edit and remove buttons for a real team member, vehicle or stall (TAX-34, TAX-35). Sample entries have none. */
export function ManageEntry({ entry }: { entry: TeamDetail }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [car, setCar] = useState(entry.vehicle ?? { registration: "", model: "", seats: 15 });
  const [stall, setStall] = useState(entry.stall ?? { name: "", location: "" });

  const person = entry.kind === "driver" || entry.kind === "staff";
  const label = person ? "Remove from team" : entry.kind === "vehicle" ? "Remove vehicle" : "Remove stall";

  async function save() {
    setBusy(true);
    setError("");
    try {
      const r = entry.kind === "vehicle" ? await updateVehicle(entry.id, car) : await updateStall(entry.id, stall);
      if (!r.ok) return setError(r.error);
      toast.success("Saved");
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      const r = person ? await removeMember(entry.id) : entry.kind === "vehicle" ? await removeVehicle(entry.id) : await removeStall(entry.id);
      if (!r.ok) return setError(r.error);
      toast.success("Removed");
      router.push("/team");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 pt-2">
      {person ? null : (
        <Button variant="outline" className="h-12 w-full rounded-full text-base font-semibold" onClick={() => { setError(""); setEditing(true); }}>
          <Pencil /> Edit details
        </Button>
      )}
      <Button variant="ghost" className="h-11 w-full rounded-full font-semibold text-destructive" onClick={() => { setError(""); setRemoving(true); }}>
        <Trash2 /> {label}
      </Button>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{entry.kind === "vehicle" ? "Edit vehicle" : "Edit stall"}</DialogTitle>
            <DialogDescription>Changes show straight away for your team.</DialogDescription>
          </DialogHeader>
          {entry.kind === "vehicle" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="e-reg">Number plate</Label>
                <Input id="e-reg" value={car.registration} onChange={(e) => setCar({ ...car, registration: e.target.value })} />
              </div>
              <div className="grid grid-cols-[1fr_6rem] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="e-model">Model</Label>
                  <Input id="e-model" value={car.model} onChange={(e) => setCar({ ...car, model: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e-seats">Seats</Label>
                  <Input id="e-seats" inputMode="numeric" value={String(car.seats)} onChange={(e) => setCar({ ...car, seats: Number(e.target.value.replace(/\D/g, "")) })} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="e-name">Stall name</Label>
                <Input id="e-name" value={stall.name} onChange={(e) => setStall({ ...stall, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-loc">Location</Label>
                <Input id="e-loc" value={stall.location} onChange={(e) => setStall({ ...stall, location: e.target.value })} />
              </div>
            </div>
          )}
          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button type="button" onClick={save} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removing} onOpenChange={setRemoving}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}?</DialogTitle>
            <DialogDescription>
              {person ? `${entry.name} will lose access to your company and go back to a personal account.` : `${entry.name} will be removed from your company.`}
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRemoving(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={remove} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              {label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
