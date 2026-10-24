import { describe, expect, it } from "vitest";
import { calcFare, fareFor } from "@/server/fare";

describe("calcFare", () => {
  const band = { id: "band-1", amountCents: 1_250 };

  it("calculates one passenger", () => {
    expect(calcFare(band, 1)).toBe(1_250);
  });

  it("calculates multiple passengers", () => {
    expect(calcFare(band, 3)).toBe(3_750);
  });

  it("handles a large sensible quantity in whole cents", () => {
    expect(calcFare(band, 1_000)).toBe(1_250_000);
  });

  it.each([0, -1, 1.5])("rejects invalid quantity %s", (qty) => {
    expect(() => calcFare(band, qty)).toThrowError("Invalid quantity");
  });

  it.each([0, -100, 12.5])("rejects invalid fare amount %s", (amountCents) => {
    expect(() => calcFare({ ...band, amountCents }, 1)).toThrowError(
      "Invalid fare",
    );
  });
});

describe("fareFor", () => {
  it("picks the requested band from a ladder route", () => {
    const route = {
      fareModel: "ladder" as const,
      bands: [
        { id: "short", amountCents: 500 },
        { id: "medium", amountCents: 1_000 },
        { id: "long", amountCents: 1_500 },
      ],
    };

    expect(fareFor(route, "medium", 1)).toBe(1_000);
  });

  it("rejects an unknown ladder band", () => {
    const route = {
      fareModel: "ladder" as const,
      bands: [{ id: "short", amountCents: 500 }],
    };

    expect(() => fareFor(route, "long", 1)).toThrowError("Unknown fare band");
  });

  it("uses the only band for a flat route, regardless of band id", () => {
    const route = {
      fareModel: "flat" as const,
      bands: [{ id: "flat", amountCents: 700 }],
    };

    expect(fareFor(route, "ignored", 1)).toBe(700);
  });

  it("rejects a flat route with multiple bands", () => {
    const route = {
      fareModel: "flat" as const,
      bands: [
        { id: "first", amountCents: 700 },
        { id: "second", amountCents: 900 },
      ],
    };

    expect(() => fareFor(route, "first", 1)).toThrowError(
      "Flat route needs one band",
    );
  });

  it("multiplies the ladder fare by quantity", () => {
    const route = {
      fareModel: "ladder" as const,
      bands: [{ id: "medium", amountCents: 1_000 }],
    };

    expect(fareFor(route, "medium", 3)).toBe(3_000);
  });

  it("multiplies the flat fare by quantity", () => {
    const route = {
      fareModel: "flat" as const,
      bands: [{ id: "flat", amountCents: 700 }],
    };

    expect(fareFor(route, "ignored", 3)).toBe(2_100);
  });
});
