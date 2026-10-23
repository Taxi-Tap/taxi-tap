import { describe, expect, it } from "vitest";
import { calcFare } from "@/server/fare";

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
