"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  ChevronDown,
  UserCircle,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/app/api/auth.api";

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileUserOpen, setMobileUserOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close the user dropdown when clicking outside it or pressing Escape.
  useEffect(() => {
    if (!userMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  // Close the mobile menu when tapping/clicking anywhere outside the navbar, or pressing Escape.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Collapse the username sub-menu whenever the mobile menu closes.
  useEffect(() => {
    if (!isOpen) setMobileUserOpen(false);
  }, [isOpen]);

  // Close menus after navigating to another page.
  useEffect(() => {
    setUserMenuOpen(false);
    setIsOpen(false);
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const data = await authApi.getCurrentUser();
      if (data.user) setUser(data.user);
      else setUser(null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUser();

    const handleScroll = () => setScrolled(window.scrollY > 20);

    const syncCart = () => {
      const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
      setCartCount(cart.length);
    };

    syncCart();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", syncCart);
    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("userLoggedIn", fetchUser);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("userLoggedIn", fetchUser);
    };
  }, []);

  const handleLogout = async () => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
    setUser(null);
    setUserMenuOpen(false);
    setIsOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(247,248,252,0.95)]"
          : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-35 h-15 rounded-xl overflow-hidden">
              <Image src="/logo.png" alt="Magnify" fill priority className="object-cover" />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative whitespace-nowrap text-sm font-semibold transition-colors duration-200 xl:text-md",
                  pathname === link.href ? "text-blue-900" : "text-slate-700 hover:text-blue-900"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.span
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-blue-900 to-red-700"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            {/* Cart - always visible */}
            <Link
              href="/checkout"
              aria-label="Shopping Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-blue-900 transition-colors"
            >
              <ShoppingCart size={20} strokeWidth={2} className="text-blue-900" />
              {mounted && cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {mounted && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 rounded-lg border border-cyan-200 bg-gradient-to-r from-blue-50 to-teal-50 px-3 py-2 text-sm font-semibold text-blue-900 transition-all hover:shadow-md xl:px-4"
                >
                  <User size={16} />
                  <span className="max-w-[100px] truncate xl:max-w-none">
                    {(user.fullName || user.email).split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn("transition-transform", userMenuOpen && "rotate-180")}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      role="menu"
                      className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-xl"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-blue-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCircle size={16} className="text-blue-900" />
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-blue-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <PackageSearch size={16} className="text-blue-900" />
                        Order Tracking
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-blue-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} className="text-blue-900" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 xl:gap-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-100 xl:px-4"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-100 xl:px-5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <Link
              href="/checkout"
              aria-label="Shopping Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-blue-900 transition-colors hover:bg-blue-50"
            >
              <ShoppingCart size={21} strokeWidth={2} className="text-blue-900" />
              {mounted && cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-900 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-900 transition-colors hover:bg-blue-50"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[#F7F8FC] bg-white shadow-[0_6px_12px_rgba(247,248,252,0.9)]"
          >
            <div className="space-y-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                    pathname === link.href
                      ? "bg-blue-50 text-blue-900"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-900"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 space-y-2 border-t border-slate-100 pt-3">
                {mounted && user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMobileUserOpen((v) => !v)}
                      aria-expanded={mobileUserOpen}
                      className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <User size={15} className="text-blue-900" />
                      <span className="flex-1 truncate text-sm font-bold text-slate-700">
                        {user.fullName || user.email}
                      </span>
                      <ChevronDown
                        size={16}
                        className={cn("text-slate-500 transition-transform", mobileUserOpen && "rotate-180")}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileUserOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-6 space-y-1 overflow-hidden border-l border-slate-100 pl-2"
                        >
                          <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <UserCircle size={16} className="text-blue-900" />
                            Profile
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <PackageSearch size={16} className="text-blue-900" />
                            Order Tracking
                          </Link>
                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              <LayoutDashboard size={16} className="text-blue-900" />
                              Admin Dashboard
                            </Link>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg bg-blue-900 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-blue-800"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg bg-red-700 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-red-800"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
