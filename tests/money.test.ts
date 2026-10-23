import { describe, expect, it } from "vitest";
import { formatCents, randsToCents, toCents } from "@/lib/money";

describe("formatCents", () => {
  it("formats normal values", () => {
    expect(formatCents(1250)).toBe("R12.50");
    expect(formatCents(1800)).toBe("R18.00");
    expect(formatCents(123456)).toBe("R1234.56");
  });

  it("formats zero and small amounts", () => {
    expect(formatCents(0)).toBe("R0.00");
    expect(formatCents(5)).toBe("R0.05");
    expect(formatCents(99)).toBe("R0.99");
  });

  it("formats negative amounts", () => {
    expect(formatCents(-500)).toBe("-R5.00");
  });

  it("rejects fractions of a cent", () => {
    expect(() => formatCents(1.5)).toThrowError("Invalid amount");
    expect(() => formatCents(Number.NaN)).toThrowError("Invalid amount");
  });
});

describe("randsToCents", () => {
  it.each([
    ["35", 3500],
    ["35.5", 3550],
    ["35.50", 3550],
    [35, 3500],
    [35.5, 3550],
    [19.99, 1999],
    ["0.1", 10],
  ])("converts %s to whole cents", (input, expected) => {
    expect(randsToCents(input)).toBe(expected);
  });

  it.each(["1.005", "-5", "0", "abc", ""])(
    "rejects invalid amount %j",
    (input) => {
      expect(() => randsToCents(input)).toThrowError("Invalid amount");
    },
  );
});

describe("toCents", () => {
  it("parses normal values", () => {
    expect(toCents("12.50")).toBe(1250);
    expect(toCents("12")).toBe(1200);
    expect(toCents("R18.00")).toBe(1800);
    expect(toCents(" 7.5 ")).toBe(750);
  });

  it("parses zero", () => {
    expect(toCents("0")).toBe(0);
    expect(toCents("0.00")).toBe(0);
  });

  it("has no float rounding errors", () => {
    expect(toCents("19.99")).toBe(1999);
    expect(toCents("0.29")).toBe(29);
    expect(toCents("1.1")).toBe(110);
  });

  it("round-trips with formatCents", () => {
    for (const c of [0, 1, 10, 99, 100, 1999, 123456]) {
      expect(toCents(formatCents(c))).toBe(c);
    }
  });

  it("rejects bad input", () => {
    expect(() => toCents("-5")).toThrow();
    expect(() => toCents("12.345")).toThrow();
    expect(() => toCents("")).toThrow();
    expect(() => toCents("abc")).toThrow();
    expect(() => toCents("1,000")).toThrow();
    expect(() => toCents(".5")).toThrow();
  });
});
