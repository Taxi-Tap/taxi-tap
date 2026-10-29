import { describe, expect, it } from "vitest";
import { homeForRole } from "@/lib/role-routing";

describe("homeForRole", () => {
  it.each([
    ["customer", "/wallet"],
    ["driver", "/trip"],
    ["merchant_staff", "/request"],
    ["owner", "/dashboard"],
    ["association_admin", "/admin"],
  ] as const)("routes %s to %s", (role, expectedHome) => {
    expect(homeForRole(role)).toBe(expectedHome);
  });
});
