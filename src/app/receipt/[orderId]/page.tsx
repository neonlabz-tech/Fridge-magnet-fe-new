"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { authApi } from "@/app/api/auth.api";
import { ordersApi } from "@/app/api/orders.api";
import {
  CustomerOrder,
  formatDateTime,
  formatRs,
  itemLineTotal,
  paymentMethodLabel,
} from "@/lib/orders";
import { cn } from "@/lib/utils";

export default function ReceiptPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = decodeURIComponent(String(params.orderId ?? ""));

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await authApi.getCurrentUser();
        if (!data?.user) {
          router.replace("/login");
          return;
        }
        const found = await ordersApi.getMyOrder(orderId);
        if (!cancelled) setOrder(found);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this receipt.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-4 text-center">
        <p className="text-slate-700">{error || "Receipt not found."}</p>
        <Link href="/orders" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Back to Order History
        </Link>
      </div>
    );
  }

  const items = order.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + itemLineTotal(item), 0);
  const deliveryFee = typeof order.deliveryFee === "number" ? order.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  const isPaid = String(order.paymentStatus ?? "").toLowerCase() === "paid";
  const paymentStatus = String(order.paymentStatus ?? "pending").toUpperCase();
  const address = [order.shippingAddress, order.district].filter(Boolean).join(", ");
  const phone = order.phone || "";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      {/* Actions (hidden when printing) */}
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between print:hidden">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="flex gap-2">
          <a
            href={ordersApi.receiptPdfUrl(order.orderId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download size={16} /> Download PDF
          </a>
        </div>
      </div>

      {/* Receipt */}
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 border-t-8 border-t-[#00205b] bg-white px-6 py-10 shadow-sm sm:px-12 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="flex items-start justify-between gap-4">
          <div className="relative h-14 w-36 -translate-x-[8%] overflow-hidden sm:h-16 sm:w-40">
            <Image src="/logo.png" alt="Magnify Creations" fill priority className="object-cover" />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">PAYMENT RECEIPT</h1>
            <p className="mt-1.5 space-y-0.5 text-[11px] leading-relaxed text-slate-500">
              <span className="block">
                Receipt No: <b className="text-slate-800">#REC-{String(order.orderId).replace(/^#/, "")}</b>
              </span>
              <span className="block">
                Order ID: <b className="text-slate-800">{String(order.orderId).startsWith("#") ? order.orderId : `#${order.orderId}`}</b>
              </span>
              <span className="block">Date: {formatDateTime(order.createdAt)}</span>
            </p>
          </div>
        </header>

        <section className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Customer Details
            </h2>
            <p className="font-bold text-slate-900">{order.customerName}</p>
            <p className="text-sm text-slate-600">{order.email}</p>
            {phone && <p className="text-sm text-slate-600">{phone}</p>}
          </div>
          <div>
            <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Delivery Destination
            </h2>
            <p className="font-bold text-slate-900">{order.customerName}</p>
            {address && <p className="whitespace-pre-line text-sm text-slate-600">{address}</p>}
            {phone && <p className="text-sm text-slate-600">Contact: {phone}</p>}
          </div>
        </section>

        <section className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-xs font-bold text-slate-600">
                <th className="px-4 py-3">Product Description</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const quantity = Number(item.quantity ?? 1);
                const details = [item.frameType, item.colorOption].filter(Boolean).join(" • ");
                return (
                  <tr key={index} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{item.name || "Custom magnet"}</p>
                      {details && <p className="text-[11px] text-slate-500">{details}</p>}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{String(quantity).padStart(2, "0")}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900">
                      {formatRs(itemLineTotal(item))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-100 p-5">
            <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Payment Information
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Method</dt>
                <dd className="font-semibold text-slate-900">{paymentMethodLabel(order.paymentMethod)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Status</dt>
                <dd className={cn("font-bold", isPaid ? "text-green-700" : "text-amber-600")}>
                  {paymentStatus}
                </dd>
              </div>
              {order.transactionRef && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Transaction Ref</dt>
                  <dd className="font-semibold text-slate-900">{order.transactionRef}</dd>
                </div>
              )}
              {order.transactionId && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Transaction ID</dt>
                  <dd className="text-xs font-semibold text-slate-900">{order.transactionId}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="space-y-2 self-end text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatRs(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              {deliveryFee > 0 ? (
                <span>{formatRs(deliveryFee)}</span>
              ) : (
                <span className="font-semibold text-green-700">Free</span>
              )}
            </div>
            <div className="flex items-baseline justify-between border-t border-dashed border-slate-300 pt-3">
              <span className="text-base font-extrabold text-slate-900">
                {isPaid ? "Total Amount Paid" : "Total Amount"}
              </span>
              <span className="text-xl font-extrabold text-red-700">{formatRs(total)}</span>
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#00205b] px-5 py-4 text-sm leading-relaxed text-blue-50 print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
          <ShieldCheck size={20} className="mt-0.5 shrink-0" />
          <p>
            {isPaid
              ? "Your payment has been received successfully, and your order has been confirmed. Thank you for shopping with us!"
              : "Your order has been received and confirmed. Thank you for shopping with us!"}
          </p>
        </div>

        <footer className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">www.magnify.lk</p>
          <p className="mt-3">Contact Support: support@magnify.lk</p>
        </footer>
      </article>
    </div>
  );
}
