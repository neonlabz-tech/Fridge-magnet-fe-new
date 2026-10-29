export interface OrderItem {
  productId?: string;
  sku?: string;
  name?: string;
  price?: number;
  quantity?: number;
  primaryImage?: string;
  uploadedImages?: string[];
  frameType?: string;
  colorOption?: string;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export interface CustomerOrder {
  _id?: string;
  orderId: string;
  customerName: string;
  email: string;
  phone?: string;
  qty: number;
  totalValue: number;
  deliveryFee?: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: string;
  district?: string;
  createdAt?: string;
  items?: OrderItem[];
  transactionRef?: string;
  transactionId?: string;
}

/** The four tracking steps shown on the progress bar. */
export const TRACKING_STEPS = [
  { key: "PENDING", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

export function normalizeStatus(status?: string): OrderStatus {
  const value = String(status ?? "").trim().toUpperCase();
  if (value === "CANCELLED") return "CANCELED";
  if (
    value === "PROCESSING" ||
    value === "SHIPPED" ||
    value === "DELIVERED" ||
    value === "CANCELED"
  ) {
    return value;
  }
  return "PENDING";
}

/** Index (0-3) of the current tracking step, or -1 for cancelled orders. */
export function trackingStepIndex(status?: string): number {
  const normalized = normalizeStatus(status);
  if (normalized === "CANCELED") return -1;
  return TRACKING_STEPS.findIndex((step) => step.key === normalized);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELED: "Cancelled",
};

export const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELED: "bg-red-50 text-red-600",
};

export function formatLKR(value: number | undefined | null): string {
  return `LKR ${Number(value ?? 0).toLocaleString("en-US")}`;
}

export function formatRs(value: number | undefined | null): string {
  return `Rs. ${Number(value ?? 0).toLocaleString("en-US")}`;
}

export function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day}, ${time}`;
}

/** Same pricing rule the backend receipt uses ("4 Magnets" packs are priced per pack of 4). */
export function itemLineTotal(item: OrderItem): number {
  const price = Number(item.price ?? 0);
  const quantity = Number(item.quantity ?? 1);
  const name = String(item.name ?? "").trim().toLowerCase();
  const packSize = name === "4 magnets" || name.startsWith("4 magnets ") ? 4 : 1;
  return price * (quantity / packSize);
}

export function paymentMethodLabel(method?: string): string {
  switch (String(method ?? "").toLowerCase()) {
    case "cod":
      return "Cash on Delivery";
    case "bank_transfer":
      return "Bank Transfer";
    case "card":
      return "Credit Card";
    case "":
      return "-";
    default:
      return String(method);
  }
}

/** Pulls a size such as "12x8" out of a product name. */
export function extractSize(name?: string): string {
  const match = String(name ?? "").match(/(\d+)\s*[x×]\s*(\d+)/i);
  return match ? `${match[1]}×${match[2]}` : "-";
}
