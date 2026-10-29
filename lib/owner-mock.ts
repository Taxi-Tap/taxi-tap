// Placeholder data for the owner screens (labelled "Sample" in the UI) until real teams,
// vehicles, stalls and GPS-stamped payments exist. Real members and routes are shown first;
// these fill the screens so the layout can be reviewed.

export type TeamKind = "driver" | "vehicle" | "stall" | "staff";

export type TeamEntry = {
  id: string;
  kind: TeamKind;
  name: string;
  /** Phone for people, registration for vehicles, area for stalls. */
  detail: string;
  sample: boolean;
};

export type TeamPerson = {
  firstName: string;
  surname: string;
  phone: string;
  dob: string;
  gender: string;
};

export type DriverProfile = {
  vehicle: string;
  seats: number;
  registration: string;
  todayCents: number;
  trips: number;
  recent: { route: string; time: string; passengers: number; amountCents: number }[];
};

export type MapPin = {
  id: string;
  kind: "vehicle" | "stall";
  title: string;
  lat: number;
  lng: number;
};

export type OwnerTx = {
  id: string;
  kind: "vehicle" | "stall";
  title: string;
  subtitle: string;
  amountCents: number;
};

export type RouteView = {
  id: string;
  name: string;
  model: "flat" | "ladder";
  bands: { id: string; label: string; amountCents: number }[];
  sample: boolean;
};

export const SAMPLE_TEAM: TeamEntry[] = [
  { id: "sample-drv-1", kind: "driver", name: "S. Mthembu", detail: "+27 000 000 0000", sample: true },
  { id: "sample-drv-2", kind: "driver", name: "B. Khumalo", detail: "+27 000 000 0000", sample: true },
  { id: "sample-stf-1", kind: "staff", name: "Ndlovu’s Shisanyama", detail: "Berea Rank", sample: true },
  { id: "sample-veh-1", kind: "vehicle", name: "Toyota Quantum", detail: "ND 41 QZ ZN", sample: true },
  { id: "sample-drv-3", kind: "driver", name: "T. Zulu", detail: "+27 000 000 0000", sample: true },
  { id: "sample-veh-2", kind: "vehicle", name: "Toyota Quantum", detail: "ND 88 TX ZN", sample: true },
  { id: "sample-stl-1", kind: "stall", name: "Mama Ndlovu’s Stall", detail: "Durban CBD", sample: true },
  { id: "sample-drv-4", kind: "driver", name: "L. Dlamini", detail: "+27 000 000 0000", sample: true },
  { id: "sample-drv-5", kind: "driver", name: "Z. Nxumalo", detail: "+27 000 000 0000", sample: true },
];

export const SAMPLE_PEOPLE: Record<string, TeamPerson> = {
  "sample-drv-1": { firstName: "Sifiso", surname: "Mthembu", phone: "+27 000 000 0000", dob: "13/06/1979", gender: "Male" },
  "sample-drv-2": { firstName: "Bheki", surname: "Khumalo", phone: "+27 000 000 0000", dob: "02/11/1984", gender: "Male" },
  "sample-drv-3": { firstName: "Thando", surname: "Zulu", phone: "+27 000 000 0000", dob: "21/03/1990", gender: "Female" },
  "sample-drv-4": { firstName: "Lwazi", surname: "Dlamini", phone: "+27 000 000 0000", dob: "09/09/1987", gender: "Male" },
  "sample-drv-5": { firstName: "Zanele", surname: "Nxumalo", phone: "+27 000 000 0000", dob: "30/01/1992", gender: "Female" },
  "sample-stf-1": { firstName: "Themba", surname: "Ndlovu", phone: "+27 000 000 0000", dob: "17/07/1975", gender: "Male" },
};

const TRIPS = [
  { route: "Rank → Berea", time: "14:02", passengers: 12, amountCents: 24000 },
  { route: "Rank → Berea", time: "11:40", passengers: 14, amountCents: 22400 },
  { route: "Rank → Berea", time: "09:15", passengers: 15, amountCents: 18000 },
];

export const SAMPLE_DRIVER_PROFILES: Record<string, DriverProfile> = {
  "sample-drv-1": { vehicle: "Toyota Quantum", seats: 15, registration: "ND 41 QZ ZN", todayCents: 312000, trips: 41, recent: TRIPS },
  "sample-drv-2": { vehicle: "Toyota Quantum", seats: 15, registration: "ND 88 TX ZN", todayCents: 273000, trips: 36, recent: TRIPS },
  "sample-drv-3": { vehicle: "Toyota Quantum", seats: 15, registration: "ND 23 KL ZN", todayCents: 235400, trips: 29, recent: TRIPS },
  "sample-drv-4": { vehicle: "Toyota HiAce", seats: 14, registration: "ND 17 PM ZN", todayCents: 198000, trips: 24, recent: TRIPS },
  "sample-drv-5": { vehicle: "Toyota HiAce", seats: 14, registration: "ND 52 RB ZN", todayCents: 154000, trips: 19, recent: TRIPS },
};

// Around Berea Road rank, Durban.
export const SAMPLE_PINS: MapPin[] = [
  { id: "pin-1", kind: "vehicle", title: "ND 41 QZ ZN · S. Mthembu", lat: -29.8512, lng: 31.0141 },
  { id: "pin-2", kind: "vehicle", title: "ND 88 TX ZN · B. Khumalo", lat: -29.8478, lng: 31.0083 },
  { id: "pin-3", kind: "vehicle", title: "ND 23 KL ZN · T. Zulu", lat: -29.8561, lng: 31.0214 },
  { id: "pin-4", kind: "vehicle", title: "ND 17 PM ZN · L. Dlamini", lat: -29.8445, lng: 31.0175 },
  { id: "pin-5", kind: "stall", title: "Mama Ndlovu’s Stall", lat: -29.8587, lng: 31.0218 },
  { id: "pin-6", kind: "stall", title: "Ndlovu’s Shisanyama", lat: -29.8502, lng: 31.0106 },
];

export const SAMPLE_OWNER_TX: OwnerTx[] = [
  { id: "otx-1", kind: "vehicle", title: "ND 23 KL ZN", subtitle: "S. Mthembu · 41 trips", amountCents: 312000 },
  { id: "otx-2", kind: "vehicle", title: "ND 41 QZ ZN", subtitle: "T. Zulu · 29 trips", amountCents: 235400 },
  { id: "otx-3", kind: "stall", title: "Mama Ndlovu’s Stall", subtitle: "Durban CBD", amountCents: 274000 },
  { id: "otx-4", kind: "vehicle", title: "ND 88 TX ZN", subtitle: "B. Khumalo · 36 trips", amountCents: 274000 },
];

export const SAMPLE_ROUTES: RouteView[] = [
  {
    id: "sample-route-1",
    name: "Rank → Berea",
    model: "ladder",
    sample: true,
    bands: [
      { id: "b1", label: "Mayville", amountCents: 1200 },
      { id: "b2", label: "Sydenham", amountCents: 1600 },
      { id: "b3", label: "Berea", amountCents: 2000 },
    ],
  },
  {
    id: "sample-route-2",
    name: "Rank → Umhlanga",
    model: "ladder",
    sample: true,
    bands: [
      { id: "b4", label: "Phoenix", amountCents: 1400 },
      { id: "b5", label: "Umhlanga", amountCents: 2200 },
    ],
  },
  { id: "sample-route-3", name: "Rank → Durban CBD", model: "flat", sample: true, bands: [{ id: "b6", label: "Any stop", amountCents: 1500 }] },
];

export const SAMPLE_WALLET = {
  balanceCents: 386400,
  currentCents: 372800,
  pendingCents: 14400,
  paymentsToday: 106,
  densest: "Densest along Rank → Berea, 14:00–17:00",
};
