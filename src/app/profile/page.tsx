"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, Loader2 } from "lucide-react";
import { authApi } from "@/app/api/auth.api";
import AccountShell, { PageSpinner, useAccountData } from "@/components/account/AccountShell";
import { PHONE_ERROR, PHONE_LENGTH, isValidPhone, normalizeStoredPhone, sanitizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ProfilePage() {
  const { user, setUser, orders, loading } = useAccountData();
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", customerAddress: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phoneNumber: normalizeStoredPhone(user.phoneNumber),
        customerAddress: user.customerAddress || "",
      });
    }
  }, [user]);

  if (loading || !user) return <PageSpinner />;

  const dirty =
    form.fullName !== (user.fullName || "") ||
    form.phoneNumber !== normalizeStoredPhone(user.phoneNumber) ||
    form.customerAddress !== (user.customerAddress || "");

  const handleCancel = () =>
    setForm({
      fullName: user.fullName || "",
      phoneNumber: normalizeStoredPhone(user.phoneNumber),
      customerAddress: user.customerAddress || "",
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (form.phoneNumber && !isValidPhone(form.phoneNumber)) {
      toast.error(PHONE_ERROR);
      return;
    }

    setSaving(true);
    try {
      // The email address is intentionally not sent: it cannot be changed.
      const data = await authApi.updateProfile({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        customerAddress: form.customerAddress.trim(),
      });
      setUser({ ...user, ...data.user });
      window.dispatchEvent(new Event("userLoggedIn")); // refresh the name in the header
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell user={user} orderCount={orders.length} active="profile">
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h1 className="text-2xl font-extrabold text-slate-900">Personal Details</h1>
        <p className="mt-1 border-b border-slate-100 pb-5 text-sm text-slate-500">
          Manage your personal information, contact numbers, and saved delivery addresses for faster
          checkout.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name
            </label>
            <input
              id="fullName"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClass}
              maxLength={120}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Email Address
                </label>
                {user.isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <Check size={11} /> Verified
                  </span>
                )}
              </div>
              <input
                id="email"
                value={user.email}
                readOnly
                disabled
                title="Email address cannot be changed"
                className={cn(inputClass, "cursor-not-allowed bg-slate-100 text-slate-500")}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: sanitizePhone(e.target.value) })}
                placeholder="0771234567"
                inputMode="numeric"
                maxLength={PHONE_LENGTH}
                aria-invalid={form.phoneNumber.length > 0 && !isValidPhone(form.phoneNumber)}
                className={cn(
                  inputClass,
                  form.phoneNumber.length > 0 &&
                    !isValidPhone(form.phoneNumber) &&
                    "border-red-300 focus:border-red-400 focus:ring-red-100",
                )}
              />
              {form.phoneNumber.length > 0 && !isValidPhone(form.phoneNumber) && (
                <p className="mt-1 text-xs text-red-500">{PHONE_ERROR}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="address" className={labelClass}>
              Shipping Address
            </label>
            <textarea
              id="address"
              rows={4}
              value={form.customerAddress}
              onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
              placeholder="House no, street, city, postal code"
              className={cn(inputClass, "resize-none")}
              maxLength={500}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!dirty || saving}
            className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </AccountShell>
  );
}
