// All fares below are clearly labelled dummy data and must never be shown as official fares (risk R02).
export const seedData = {
  associations: [
    { key: "assoc-durban", name: "Durban Taxi Association (demo)" },
  ],
  organisations: [
    {
      key: "org-mbeki-taxis",
      name: "Mbeki Taxis (demo)",
      type: "owner-business",
      associationKey: "assoc-durban",
    },
    {
      key: "org-zodwa-stall",
      name: "Mama Zodwa's Stall (demo)",
      type: "merchant",
    },
  ],
  profiles: [
    { key: "cust-thandi", name: "Thandi", role: "customer" },
    { key: "driver-sipho", name: "Sipho", role: "driver" },
    { key: "owner-mbeki", name: "Mr Mbeki", role: "owner" },
    {
      key: "admin-nomsa",
      name: "Nomsa",
      role: "association_admin",
    },
    { key: "staff-zodwa", name: "Zodwa", role: "merchant_staff" },
  ],
  vehicles: [
    {
      key: "vehicle-nd-123-456",
      registration: "ND 123-456",
      ownerOrganisationKey: "org-mbeki-taxis",
    },
    {
      key: "vehicle-nd-789-012",
      registration: "ND 789-012",
      ownerOrganisationKey: "org-mbeki-taxis",
    },
  ],
  routes: [
    {
      key: "route-cbd-umlazi",
      name: "CBD – Umlazi",
      fareModel: "ladder",
      bands: [
        { key: "fare-mobeni", name: "To Mobeni", amountCents: 1800 },
        { key: "fare-umlazi", name: "To Umlazi", amountCents: 2500 },
      ],
    },
    {
      key: "route-cbd-berea",
      name: "CBD – Berea",
      fareModel: "flat",
      bands: [{ key: "fare-berea", name: "Berea", amountCents: 1500 }],
    },
  ],
  wallets: [
    { key: "wallet-thandi", profileKey: "cust-thandi", balanceCents: 20000 },
    { key: "wallet-sipho", profileKey: "driver-sipho", balanceCents: 0 },
    { key: "wallet-mbeki", profileKey: "owner-mbeki", balanceCents: 0 },
    { key: "wallet-nomsa", profileKey: "admin-nomsa", balanceCents: 0 },
    { key: "wallet-zodwa", profileKey: "staff-zodwa", balanceCents: 0 },
  ],
} as const;
