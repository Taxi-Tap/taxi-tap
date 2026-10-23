import { describe, expect, it } from "vitest";
import { seedData } from "@/scripts/seed-data";

describe("seedData", () => {
  const allKeys = [
    ...seedData.associations.map(({ key }) => key),
    ...seedData.organisations.map(({ key }) => key),
    ...seedData.profiles.map(({ key }) => key),
    ...seedData.vehicles.map(({ key }) => key),
    ...seedData.routes.map(({ key }) => key),
    ...seedData.routes.flatMap((route) => route.bands.map(({ key }) => key)),
    ...seedData.wallets.map(({ key }) => key),
  ];

  it("uses unique stable keys for every item", () => {
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });

  it("uses valid profile roles", () => {
    const roles = [
      "customer",
      "driver",
      "owner",
      "association_admin",
      "merchant_staff",
    ];

    for (const profile of seedData.profiles) {
      expect(roles).toContain(profile.role);
    }
  });

  it("uses positive whole-cent fares and non-negative whole-cent balances", () => {
    for (const route of seedData.routes) {
      for (const band of route.bands) {
        expect(Number.isInteger(band.amountCents)).toBe(true);
        expect(band.amountCents).toBeGreaterThan(0);
      }
    }

    for (const wallet of seedData.wallets) {
      expect(Number.isInteger(wallet.balanceCents)).toBe(true);
      expect(wallet.balanceCents).toBeGreaterThanOrEqual(0);
    }
  });

  it("has exactly one band for flat routes and at least two for ladder routes", () => {
    for (const route of seedData.routes) {
      if (route.fareModel === "flat") {
        expect(route.bands).toHaveLength(1);
      } else {
        expect(route.bands.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("resolves every reference to an existing key", () => {
    const associationKeys = new Set(seedData.associations.map(({ key }) => key));
    const organisationKeys = new Set(
      seedData.organisations.map(({ key }) => key),
    );
    const profileKeys = new Set(seedData.profiles.map(({ key }) => key));

    for (const organisation of seedData.organisations) {
      if ("associationKey" in organisation) {
        expect(associationKeys.has(organisation.associationKey)).toBe(true);
      }
    }

    for (const vehicle of seedData.vehicles) {
      expect(organisationKeys.has(vehicle.ownerOrganisationKey)).toBe(true);
    }

    for (const wallet of seedData.wallets) {
      expect(profileKeys.has(wallet.profileKey)).toBe(true);
    }
  });
});
