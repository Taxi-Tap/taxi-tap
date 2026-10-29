// Shapes shared by the personal-account server actions and screens.

export type TxCategory = "taxi" | "stall" | "recharge" | "transfer";

export type TxView = {
  id: string;
  direction: "in" | "out";
  /** Always positive; use `direction` for the sign. */
  amountCents: number;
  category: TxCategory;
  title: string;
  subtitle: string;
  status: "success" | "failed" | "pending";
  failureReason: string | null;
  method: "qr" | "nfc" | "simulated";
  counterparty: string;
  /** Short human reference, e.g. TT-8F21AC. */
  reference: string;
  location: string | null;
  createdAt: string;
};

export type WalletSummary = {
  walletId: string;
  balanceCents: number;
  /** Last four digits shown on the virtual card. */
  cardLast4: string;
  /** Full demo card number (16 digits, ungrouped) and the name printed on the card. */
  cardNumber: string;
  holder: string;
};

export type ActionResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

export type Destination = {
  id: string;
  title: string;
  subtitle: string;
  amountCents?: number;
};

export type ReaderQuote = {
  payeeWalletId: string;
  payeeName: string;
  amountCents: number;
  label: string;
  bandId?: string;
};

export type NotificationView = {
  id: string;
  kind: "payment" | "topup" | "receipt" | "security" | "promo";
  title: string;
  body: string;
  unread: boolean;
  createdAt: string;
};

export type AccountView = {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  smsAlerts: boolean;
  promotions: boolean;
  language: string;
  twoFactorEnabled: boolean;
  unreadNotifications: number;
};
