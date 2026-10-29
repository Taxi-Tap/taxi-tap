import { AppHeader } from "@/components/personal/app-header";
import { ShiftPicker } from "@/components/work/shift-picker";
import { getActiveTrip, getShiftOptions } from "@/server/driver";

// Shift: pick a vehicle and a route. Fares go to the owner business wallet, not the driver.
export default async function ShiftPage() {
  const [options, active] = await Promise.all([getShiftOptions(), getActiveTrip()]);
  return (
    <main>
      <AppHeader title="Shift" backHref="/trip" />
      <ShiftPicker
        company={options.company}
        vehicles={options.vehicles}
        routes={options.routes}
        activeTrip={active ? { vehicle: active.vehicle.registration, route: active.route.name } : null}
      />
    </main>
  );
}
