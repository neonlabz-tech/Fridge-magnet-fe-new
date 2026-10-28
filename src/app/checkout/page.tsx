"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { fadeUp, staggerContainer } from "@/lib/motion";
import {
  ChevronLeft,
  CreditCard,
  Truck,
  Loader2,
  ShoppingBag,
  MapPin,
  Trash2,
  ImageIcon,
  Landmark,
  Upload,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/data";
import api from "@/lib/axios";
import { PHONE_ERROR, PHONE_LENGTH, isValidPhone, normalizeStoredPhone, sanitizePhone } from "@/lib/phone";

// Flat delivery fee for every address.
const DELIVERY_FEE = 300;
const MAX_SLIP_SIZE = 5 * 1024 * 1024; // 5 MB

type PaymentMethod = "cod" | "bank_transfer" | "card";

const BANK_DETAILS = [
  { label: "Account Name", value: "Magnify" },
  { label: "Account Number", value: "1234 5678 9101" },
  { label: "Bank Name", value: "Commercial Bank" },
  { label: "Branch Name", value: "Jaffna main branch" },
];

function isJaffnaAddress(address: string) {
  return address.toLowerCase().includes("jaffna");
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    const stored: CartItem[] = JSON.parse(sessionStorage.getItem("cart") || "[]");
    if (stored.length === 0) {
      toast.error("Your cart is empty.");
      router.push("/shop");
      return;
    }
    setCart(stored);

    api.get("/auth/profile")
      .then(({ data: d }) => {
        if (d.user) {
          setForm((prev) => ({
            ...prev,
            customerName: d.user.fullName || "",
            customerEmail: d.user.email || "",
            customerPhone: normalizeStoredPhone(d.user.phoneNumber),
            address: d.user.customerAddress || "",
          }));
        }
      })
      .catch(() => {});
  }, [router]);

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
    if (updated.length === 0) router.push("/shop");
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const deliveryFee = DELIVERY_FEE;
  const totalPrice = subtotal + deliveryFee;

  const hasAddress = form.address.trim() !== "";
  const jaffna = isJaffnaAddress(form.address);
  const deliveryNote = jaffna ? "1 day delivery" : "2 to 3 working days delivery";

  // Cash on Delivery is only possible for Jaffna addresses.
  useEffect(() => {
    if (paymentMethod === "cod" && !jaffna) setPaymentMethod("bank_transfer");
  }, [paymentMethod, jaffna]);

  // Local preview of the chosen bank slip.
  useEffect(() => {
    if (!slipFile) {
      setSlipPreview(null);
      return;
    }
    const url = URL.createObjectURL(slipFile);
    setSlipPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [slipFile]);

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image of your receipt (JPG, PNG or WEBP).");
      return;
    }
    if (file.size > MAX_SLIP_SIZE) {
      toast.error("Receipt image must be 5 MB or smaller.");
      return;
    }
    setSlipFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!isValidPhone(form.customerPhone)) {
      toast.error(PHONE_ERROR);
      return;
    }

    if (paymentMethod === "card") {
      toast.error("Card payment is currently unavailable.");
      return;
    }

    if (paymentMethod === "cod" && !jaffna) {
      toast.error("Cash on Delivery is available only for Jaffna addresses.");
      return;
    }

    if (paymentMethod === "bank_transfer" && !slipFile) {
      toast.error("Please upload your bank transfer receipt.");
      return;
    }

    setSubmitting(true);
    try {
      // Bank transfer: upload the receipt to Cloudflare R2 (receipts folder) first.
      let paymentSlipUrl: string | undefined;
      if (paymentMethod === "bank_transfer" && slipFile) {
        const formData = new FormData();
        formData.append("files", slipFile);
        formData.append("folder", "receipts");
        const uploadRes = await fetch("/api/upload-r2", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Failed to upload the receipt. Please try again.");
        const uploaded = await uploadRes.json();
        paymentSlipUrl = uploaded.urls?.[0];
        if (!paymentSlipUrl) throw new Error("Failed to upload the receipt. Please try again.");
      }

      const { data } = await api.post("/orders", {
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        customerName: form.customerName,
        email: form.customerEmail,
        phone: form.customerPhone,
        shippingAddress: form.address,
        notes: form.notes,
        deliveryFee,
        totalValue: totalPrice,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.productName,
          price: Number(item.price),
          quantity: 1,
          primaryImage: item.primaryImage?.secure_url || "",
          uploadedImages: item.uploadedImageUrls,
        })),
        qty: cart.length,
        paymentMethod,
        ...(paymentSlipUrl ? { paymentSlipUrl } : {}),
      });

      sessionStorage.removeItem("cart");
  window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Order placed successfully! 🎉");
      router.push(`/order-success?orderId=${data.orderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50/30 to-white">
        <div className="w-14 h-14 border-4 border-blue-50 border-t-blue-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/shop")}
          className="flex items-center gap-1.5 text-slate-400 hover:text-blue-900 mb-10 transition-colors text-sm font-medium group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Continue Shopping
        </motion.button>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-[1fr_1.3fr] gap-8"
        >
          {/* ── Left: Cart Items + Summary ── */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-black text-slate-800">Your Order</h2>
              <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full">
                {cart.length} item{cart.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Cart items */}
            {cart.map((item, index) => (
              <div key={index} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {item.primaryImage?.secure_url ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.primaryImage.secure_url} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
                        <ImageIcon size={20} className="text-blue-900" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm leading-snug">{item.productName}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.uploadedImageUrls.length} photo{item.uploadedImageUrls.length > 1 ? "s" : ""} uploaded
                    </p>
                    <p className="text-base font-black text-blue-900 mt-2">{formatPrice(item.price)}</p>
                  </div>

                  <button
                  
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}

            {/* Price summary */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2.5">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-slate-500">
                  <span className="truncate pr-4">{item.productName}</span>
                  <span className="font-semibold text-slate-700 flex-shrink-0">{formatPrice(item.price)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-slate-500 pt-1">
                <span>Delivery</span>
                <span className="text-red-600 font-semibold">
                  {formatPrice(deliveryFee.toString())}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-2xl font-black text-blue-900">{formatPrice(totalPrice.toString())}</span>
              </div>
              {hasAddress && (
                <p className="text-xs font-semibold text-red-600 text-right">{deliveryNote}</p>
              )}
            </div>
          </motion.div>

          {/* ── Right: Delivery + Payment ── */}
          <motion.div variants={fadeUp}>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Delivery Details */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                    <MapPin size={15} className="text-red-600" />
                  </div>
                  <h2 className="text-lg font-black text-slate-800">Delivery Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name *</label>
                    <input
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-900 transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone *</label>
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={PHONE_LENGTH}
                      pattern={`\\d{${PHONE_LENGTH}}`}
                      title={PHONE_ERROR}
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: sanitizePhone(e.target.value) })}
                      placeholder="0771234567"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-900 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      placeholder="Your email address"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-900 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Delivery Address *</label>
                    <textarea
                      required
                      rows={3}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Street, city, postal code…"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-900 transition-all resize-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Order Notes</label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Any special instructions…"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-900 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                    <CreditCard size={15} className="text-blue-900" />
                  </div>
                  <h2 className="text-lg font-black text-slate-800">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {([
                    {
                      key: "cod" as const,
                      title: "Cash on Delivery",
                      subtitle: "Jaffna only",
                      icon: Truck,
                      disabled: !jaffna,
                    },
                    {
                      key: "bank_transfer" as const,
                      title: "Bank Transfer",
                      subtitle: "All addresses",
                      icon: Landmark,
                      disabled: false,
                    },
                    {
                      key: "card" as const,
                      title: "Card Payment",
                      subtitle: "Unavailable",
                      icon: CreditCard,
                      disabled: true,
                    },
                  ]).map(({ key, title, subtitle, icon: Icon, disabled }) => {
                    const selected = paymentMethod === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        onClick={() => setPaymentMethod(key)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                          selected
                            ? "border-blue-900 bg-blue-50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        } ${disabled ? "opacity-50 cursor-not-allowed hover:border-slate-200" : ""}`}
                      >
                        <div
                          className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center ${
                            selected ? "bg-blue-900" : "bg-slate-100"
                          }`}
                        >
                          <Icon size={16} className={selected ? "text-white" : "text-slate-400"} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold ${selected ? "text-red-600" : "text-slate-600"}`}>
                            {title}
                          </p>
                          <p className="text-xs text-slate-400">{subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="mb-5 space-y-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-900">
                        Bank Details
                      </p>
                      <dl className="space-y-2 text-sm">
                        {BANK_DETAILS.map((row) => (
                          <div key={row.label} className="flex justify-between gap-4">
                            <dt className="text-slate-500">{row.label}</dt>
                            <dd className="font-semibold text-slate-800 text-right">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                        Upload Payment Receipt *
                      </label>
                      <input
                        ref={slipInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSlipChange}
                        className="hidden"
                      />
                      {slipFile && slipPreview ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slipPreview} alt="Payment receipt" className="h-16 w-16 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-700">{slipFile.name}</p>
                            <button
                              type="button"
                              onClick={() => slipInputRef.current?.click()}
                              className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                              Change
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSlipFile(null)}
                            aria-label="Remove receipt"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 hover:bg-red-100"
                          >
                            <X size={14} className="text-red-600" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => slipInputRef.current?.click()}
                          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition-all hover:border-blue-300 hover:bg-blue-50/40"
                        >
                          <Upload size={20} className="text-blue-900" />
                          <span className="text-sm font-semibold text-slate-600">
                            Click to upload your bank receipt
                          </span>
                          <span className="text-xs text-slate-400">JPG, PNG or WEBP • max 5 MB</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || paymentMethod === "card"}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-900 text-white font-black py-4 px-6 rounded-2xl hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      Place Order · {formatPrice(totalPrice.toString())}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
