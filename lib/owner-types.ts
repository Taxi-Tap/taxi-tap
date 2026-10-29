export type CompanyView = {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  location: string | null;
  type: "association" | "business" | "merchant";
  /** 9 letters/digits, ungrouped. */
  joinCode: string;
  memberCount: number;
  createdAt: string;
};

export type OwnerView = {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
};

export type TeamDetail = {
  id: string;
  kind: "driver" | "vehicle" | "stall" | "staff";
  name: string;
  detail: string;
  sample: boolean;
  person?: { firstName: string; surname: string; phone: string; dob: string; gender: string };
  driver?: {
    vehicle: string;
    seats: number;
    registration: string;
    todayCents: number;
    trips: number;
    recent: { route: string; time: string; passengers: number; amountCents: number }[];
  };
};
