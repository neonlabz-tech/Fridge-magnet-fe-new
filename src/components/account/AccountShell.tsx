"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, MessageCircle, Package, ShoppingBag, User } from "lucide-react";
import { authApi } from "@/app/api/auth.api";
import { ordersApi } from "@/app/api/orders.api";
import type { CustomerOrder } from "@/lib/orders";
import { cn } from "@/lib/utils";

export interface AccountUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive?: boolean;
  avatar?: string;
  phoneNumber?: string;
  customerAddress?: string;
  createdAt?: string;
}

/** Loads the logged-in customer and their orders; sends guests to /login. */
export function useAccountData() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await authApi.getCurrentUser();
      if (!data?.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
    } catch {
      router.replace("/login");
      return;
    }

    try {
      setOrders(await ordersApi.getMyOrders());
      setOrdersError("");
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Could not load your orders.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return { user, setUser, orders, loading, ordersError };
}

function memberSince(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

export default function AccountShell({
  user,
  orderCount,
  active,
  children,
}: {
  user: AccountUser;
  orderCount: number;
  active: "profile" | "orders";
  children: React.ReactNode;
}) {
  const displayName = user.fullName || user.email;
  const since = memberSince(user.createdAt);

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
    window.location.href = "/";
  };

  const navItem = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-blue-900",
    );

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[22rem_1fr]">
        {/* Sidebar */}
        <aside className="space-y-5 lg:self-start">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="relative shrink-0">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-blue-50"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl font-bold text-white ring-4 ring-blue-50">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              {since && (
                <span className="mt-1.5 inline-block rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  Member since {since}
                </span>
              )}
            </div>
          </div>

          <nav className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <Link href="/profile" className={navItem(active === "profile")}>
              <User size={18} />
              <span className="flex-1">Personal Details</span>
              {active === "profile" && <ChevronRight size={16} />}
            </Link>
            <Link href="/orders" className={navItem(active === "orders")}>
              <ShoppingBag size={18} />
              <span className="flex-1">Order History</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {orderCount} {orderCount === 1 ? "Order" : "Orders"}
              </span>
            </Link>
            <div className="mx-2 my-1 border-t border-slate-100" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-5 text-white shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-300">
              <MessageCircle size={14} />
              Need help with prints?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Have questions about your magnet order resolution, custom cropping or shipping status?
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Chat With Magnify Support
              <ChevronRight size={14} />
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}

export function EmptyOrders() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Package size={22} />
      </div>
      <p className="font-semibold text-slate-800">No orders yet</p>
      <p className="mt-1 text-sm text-slate-500">Your custom magnet orders will appear here.</p>
      <Link
        href="/shop"
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Start Shopping
      </Link>
    </div>
  );
}
