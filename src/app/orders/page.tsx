"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ImageIcon, MapPin, Truck } from "lucide-react";
import AccountShell, {
  EmptyOrders,
  PageSpinner,
  useAccountData,
} from "@/components/account/AccountShell";
import {
  CustomerOrder,
  OrderItem,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  TRACKING_STEPS,
  formatDate,
  formatLKR,
  itemLineTotal,
  normalizeStatus,
  trackingStepIndex,
} from "@/lib/orders";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

type Tab = "ALL" | "DELIVERED" | "PROCESSING" | "CANCELED";

const IN_PROGRESS = ["PENDING", "PROCESSING", "SHIPPED"];

function matchesTab(order: CustomerOrder, tab: Tab) {
  const status = normalizeStatus(order.status);
  if (tab === "ALL") return true;
  if (tab === "PROCESSING") return IN_PROGRESS.includes(status);
  return status === tab;
}

const outlineBtn =
  "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700";

/** Order ids are stored with a leading "#" for some orders - never show it twice. */
const displayOrderId = (id: string) => (String(id).startsWith("#") ? id : `#${id}`);

type ProductImages = Record<string, string>;

function resolveImage(item: OrderItem, images: ProductImages) {
  return (
    item.primaryImage ||
    (item.productId ? images[item.productId] : "") ||
    (item.sku ? images[item.sku] : "") ||
    ""
  );
}

function ItemThumb({ src, className }: { src?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-blue-600",
        className,
      )}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <ImageIcon size={20} />
      )}
    </div>
  );
}

function OrderCard({ order, images }: { order: CustomerOrder; images: ProductImages }) {
  const status = normalizeStatus(order.status);
  const step = trackingStepIndex(status);
  const inProgress = IN_PROGRESS.includes(status);
  const address = [order.shippingAddress, order.district].filter(Boolean).join(", ");
  const items = order.items ?? [];
  const receiptHref = `/receipt/${encodeURIComponent(order.orderId)}`;
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Order ID</p>
            <p className="font-bold text-slate-900">{displayOrderId(order.orderId)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Placed on</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total amount</p>
            <p className="text-sm font-bold text-slate-900">{formatLKR(order.totalValue)}</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            STATUS_BADGE_CLASSES[status],
          )}
        >
          {inProgress && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Tracking */}
      {inProgress && step >= 0 && (
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
              <Truck size={14} className="text-blue-600" />
              Tracking your order
            </span>
            <span className="text-slate-400">
              Step {step + 1} of {TRACKING_STEPS.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {TRACKING_STEPS.map((s, i) => (
              <div key={s.key}>
                <div className={cn("h-1.5 rounded-full", i <= step ? "bg-blue-600" : "bg-slate-200")} />
                <p
                  className={cn(
                    "mt-1.5 text-center text-[11px] font-semibold",
                    i <= step ? "text-blue-700" : "text-slate-400",
                  )}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary: product images + expand toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50/60"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex -space-x-3">
            {items.slice(0, 4).map((item, index) => (
              <ItemThumb
                key={`${item.productId ?? "item"}-${index}`}
                src={resolveImage(item, images)}
                className="h-12 w-12 border-2 border-white"
              />
            ))}
            {items.length > 4 && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-slate-100 text-xs font-bold text-slate-600">
                +{items.length - 4}
              </div>
            )}
          </div>
          <p className="truncate text-sm font-semibold text-slate-700">
            {items.length > 0
              ? `${items.length} ${items.length === 1 ? "item" : "items"}`
              : `${order.qty} item(s)`}
            {items[0]?.name ? ` · ${items[0].name}${items.length > 1 ? " & more" : ""}` : ""}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600">
          {open ? "Hide details" : "View details"}
          <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {open && (
        <>
          {/* Items */}
          <div className="divide-y divide-slate-100 border-t border-slate-100 px-5">
            {items.map((item, index) => {
              const details = [item.frameType, item.colorOption].filter(Boolean).join(" • ");
              return (
                <div key={`${item.productId ?? "item"}-${index}`} className="flex items-center gap-4 py-4">
                  <ItemThumb src={resolveImage(item, images)} className="h-14 w-14" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">{item.name || "Custom magnet"}</p>
                    {details && <p className="truncate text-xs text-slate-500">{details}</p>}
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {item.sku ? `SKU: ${item.sku} • ` : ""}Qty: {item.quantity ?? 1}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-slate-900">{formatLKR(itemLineTotal(item))}</p>
                </div>
              );
            })}
            {items.length === 0 && (
              <p className="py-4 text-sm text-slate-500">Order of {order.qty} item(s).</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-4">
            <p className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
              {address && <MapPin size={14} className="shrink-0 text-slate-400" />}
              <span className="truncate">
                {address ? `${status === "DELIVERED" ? "Delivered to" : "Delivering to"}: ${address}` : ""}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={receiptHref} className={outlineBtn}>
                View Receipt
              </Link>
              {inProgress || status === "CANCELED" ? (
                <Link href="/contact" className={outlineBtn}>
                  Need Support
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}
    </article>
  );
}

export default function OrdersPage() {
  const { user, orders, loading, ordersError } = useAccountData();
  const [tab, setTab] = useState<Tab>("ALL");
  const [images, setImages] = useState<ProductImages>({});

  // Fallback product images for orders whose items did not store one.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/products");
        const list = (res.data?.data?.products ?? []) as {
          _id?: string;
          productId?: string;
          primaryImage?: { secure_url?: string };
        }[];
        const map: ProductImages = {};
        for (const p of list) {
          const url = p.primaryImage?.secure_url;
          if (!url) continue;
          if (p._id) map[p._id] = url;
          if (p.productId) map[p.productId] = url;
        }
        if (active) setImages(map);
      } catch {
        /* images are optional */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      ALL: orders.length,
      DELIVERED: orders.filter((o) => matchesTab(o, "DELIVERED")).length,
      PROCESSING: orders.filter((o) => matchesTab(o, "PROCESSING")).length,
      CANCELED: orders.filter((o) => matchesTab(o, "CANCELED")).length,
    }),
    [orders],
  );

  const visible = useMemo(() => {
    return orders.filter((order) => matchesTab(order, tab));
  }, [orders, tab]);

  if (loading || !user) return <PageSpinner />;

  const tabs: { key: Tab; label: string }[] = [
    { key: "ALL", label: "All Orders" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "PROCESSING", label: "Processing" },
    { key: "CANCELED", label: "Cancelled" },
  ];

  return (
    <AccountShell user={user} orderCount={orders.length} active="orders">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Order History</h1>
            <p className="mt-1 max-w-lg text-sm text-slate-500">
              Track the status of your custom magnet and photo print orders and view your receipts.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-semibold transition",
                  tab === t.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                )}
              >
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>
        </div>
      </section>

      {ordersError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {ordersError}
        </div>
      )}

      {orders.length === 0 && !ordersError ? (
        <EmptyOrders />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No orders match your filters.
        </div>
      ) : (
        visible.map((order) => <OrderCard key={order.orderId} order={order} images={images} />)
      )}
    </AccountShell>
  );
}
