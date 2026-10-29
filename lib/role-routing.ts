export type AppRole =
  | "customer"
  | "driver"
  | "merchant_staff"
  | "owner"
  | "association_admin";

export function homeForRole(role: AppRole): string {
  switch (role) {
    case "customer":
      return "/home";
    case "driver":
      return "/trip";
    case "merchant_staff":
      return "/request";
    case "owner":
      return "/dashboard";
    case "association_admin":
      return "/admin";
  }
}
