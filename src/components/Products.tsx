'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { ArrowRight, Magnet, Frame } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { productApi } from "@/app/api/product.api";
import { Product } from "@/lib/data";
import { AnimatedSection } from "./ui/AnimatedSection";
import { Eyebrow } from "./ui/Eyebro";

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

// Same cookie check used on the shop page / login page
function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return !!match?.[1];
}

export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleOrderNow = (productId: string) => {
      router.push(`/shop/${productId}`);
  };

  return (
    <section className="py-20 bg-white">
      <div className={CONTAINER}>
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="flex justify-center">
              <Eyebrow>Our Collection</Eyebrow>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-blue-900 mt-2 mb-4">
              Curated Classic
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Choose from our curated selection of premium magnetic photo
              products.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-slate-100 rounded-3xl h-80 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div variants={fadeUp} className="text-center py-16">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Magnet size={32} className="text-blue-900" />
              </div>
              <p className="text-slate-500">
                No products yet. Check back soon!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <motion.div
                  key={product._id}
                  variants={fadeUp}
                  onClick={() => handleOrderNow(product._id)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 card-hover shadow-sm cursor-pointer"                >
                  {(() => {
                    const imageUrl =
                      product.primaryImage?.secure_url ||
                      product.galleryImages?.[0]?.secure_url;

                    return (
                  <div className="relative h-75 sm:h-56 lg:h-52 bg-gradient-to-br from-blue-50 to-teal-50 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Frame size={48} className="text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-blue-900 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                      {product.imagecount} photos
                    </div>
                  </div>
                    );
                  })()}
                  <div className="p-5">
                    <h3 className="font-bold text-blue-900 mb-1 text-base">
                      {product.productName}
                    </h3>
                    <p className="text-slate-500 text-xs mb-4 line-clamp-2">
                      {product.description
                        ? product.description.replace(/<[^>]+>/g, "")
                        : "Premium magnetic photo tile"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-blue-900">
                        {formatPrice(product.price)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderNow(product._id);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-50 transition-all cursor-pointer"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <motion.div variants={fadeUp} className="text-center mt-10">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white border-2 border-blue-900 text-blue-900 px-8 py-4 rounded-2xl font-bold hover:bg-[#F9F9FE] hover:border-blue-900 transition-all hover:-translate-y-0.5"
              >
                Show More Products <ArrowRight size={18} />
              </Link>
            </motion.div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}