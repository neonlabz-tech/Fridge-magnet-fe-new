"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Frame, Search, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { productApi } from "@/app/api/product.api";
import { Product } from "@/lib/data";

// Reads the auth token cookie the same way the axios interceptor does
function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return !!match?.[1];
}

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    productApi.getAllProducts()
      .then((data) => {
        setProducts(data);
        setFiltered(data);
      })
      .catch((e) => console.error("Failed to fetch products:", e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      )
    );
  }, [search, products]);

  const handleOrderNow = (productId: string) => {
      router.push(`/shop/${productId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative pt-20 pb-10 bg-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative z-10 flex w-full shrink-0 flex-col items-center justify-center px-4 py-5 text-center sm:w-[42%] sm:items-start sm:px-4 sm:text-left md:w-[40%] md:px-6 lg:w-[40%] lg:pl-8 lg:pr-4">
              <h1 className="mb-2 text-[25px] font-extrabold leading-tight sm:text-[32px] md:text-[40px] lg:text-[52px]">
                <span className="text-blue-900">Our </span>
                <span className="text-[#D40B0B]">Collections</span>
              </h1>
              <div className="mb-3 h-[3px] w-10 rounded-full bg-[#D40B0B] sm:w-14" />
              <p className="max-w-[360px] text-[11px] leading-relaxed text-gray-500 sm:text-[13px] md:text-[15px] lg:text-[18px]">
                Transform your memories into premium magnetic photo art.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-900 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <SlidersHorizontal size={16} />
            <span>{filtered.length} products</span>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Frame size={40} className="text-blue-900" />
            </div>
            <h3 className="text-2xl font-black text-slate-700 mb-2">No Products Found</h3>
            <p className="text-slate-400">Try adjusting your search.</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((product) => (
              <motion.div
                key={product._id}
                variants={fadeUp}
                onClick={() => {
                  if (product.stock > 0) {
                    handleOrderNow(product._id);
                  }
                }}
                className={`group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm ${
                  product.stock > 0
                    ? "cursor-pointer card-hover"
                    : "cursor-not-allowed opacity-75"
                }`}
              >
                <div className="relative h-75 sm:h-56 lg:h-52 bg-gradient-to-br from-blue-50 to-teal-50 overflow-hidden">
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage.secure_url}
                      alt={product.productName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Frame size={48} className="text-blue-50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-blue-900 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                    {product.imagecount} photos
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-3 right-3 bg-orange-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                      Low stock
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-slate-700 px-4 py-2 rounded-full font-bold text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-400 mb-1 font-mono">{product.productId}</p>
                  <h3 className="font-bold text-slate-800 mb-2 text-base leading-snug">
                    {product.productName}
                  </h3>
                  <p className="text-slate-500 text-xs mb-4 line-clamp-2">
                    {product.description
                      ? product.description.replace(/<[^>]+>/g, "")
                      : "Premium magnetic photo tile set"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-blue-900">
                        {formatPrice(product.price)}
                      </span>
                      <p className="text-xs text-slate-400">{product.stock} in stock</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        if (product.stock > 0) {
                          handleOrderNow(product._id);
                        }
                      }}
                      disabled={product.stock === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        product.stock === 0
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:shadow-lg hover:shadow-blue-50"
                      }`}
                    >
                      {product.stock === 0 ? "Sold Out" : "Order"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="py-10" />
    </div>
  );
}