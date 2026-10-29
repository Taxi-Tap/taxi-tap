// Shapes for the driver and merchant screens.

export type VehicleOption = { id: string; registration: string; model: string; seats: number };

export type RouteOption = {
  id: string;
  name: string;
  model: "flat" | "ladder";
  bands: { id: string; label: string; amountCents: number }[];
};

export type ActiveTrip = {
  id: string;
  startedAt: string;
  vehicle: VehicleOption;
  route: RouteOption;
  totalCents: number;
  payments: number;
  passengers: number;
};

export type TakingsView = {
  todayCents: number;
  payments: number;
  passengers: number;
  trips: number;
  recent: { id: string; time: string; label: string; passengers: number; amountCents: number; ok: boolean }[];
};

export type PaymentRequestView = {
  id: string;
  code: string;
  amountCents: number;
  status: "pending" | "paid" | "cancelled" | "expired";
  expiresAt: string;
  company: string;
};

export type SaleView = {
  id: string;
  time: string;
  day: string;
  title: string;
  amountCents: number;
  by: string;
};

export type ShopHome = {
  company: string;
  todayCents: number;
  salesToday: number;
  recent: SaleView[];
};
