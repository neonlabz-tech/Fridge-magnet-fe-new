"use client";
import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { fadeUp, staggerContainer } from "@/lib/motion";
import {
  Upload,
  X,
  Frame,
  ChevronLeft,
  Loader2,
  ShoppingCart,
  ImageIcon,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { productApi } from "@/app/api/product.api";
import { CartItem, Product } from "@/lib/data";

function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return !!match?.[1];
}
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp",
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  // Read the login cookie on the client (a module-level check goes stale after
  // logging in via client-side navigation).
  const [loggedIn, setLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return JSON.parse(sessionStorage.getItem("cart") || "[]").length;
  });

  useEffect(() => {
    const syncLogin = () => setLoggedIn(isLoggedIn());
    syncLogin();
    window.addEventListener("userLoggedIn", syncLogin);
    window.addEventListener("focus", syncLogin);
    return () => {
      window.removeEventListener("userLoggedIn", syncLogin);
      window.removeEventListener("focus", syncLogin);
    };
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productApi.getProductById(id);
        setProduct(res);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const maxCount = product?.imagecount ?? 0;
  const remainingSlots = Math.max(maxCount - uploadedFiles.length, 0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    // Limit is enforced cumulatively in onDrop; when only one slot is left the
    // file dialog switches to single-selection.
    multiple: remainingSlots > 1,
    onDrop: (acceptedFiles) => {
      if (!isLoggedIn()) {
        router.push(`/login?redirect=${encodeURIComponent(`/shop/${id}`)}`);
        return;
      }
      if (maxCount <= 0 || acceptedFiles.length === 0) return;

      // Too many files for the remaining slots: reject the whole selection.
      if (acceptedFiles.length > remainingSlots) {
        toast.error(
          remainingSlots === 0
            ? `Maximum ${maxCount} photos allowed for this product`
            : `You can select only ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"} (maximum ${maxCount}). Please select again.`,
        );
        return;
      }

      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isLoggedIn()) {
    // toast.error("Please login to continue");
    router.push(`/login?redirect=${encodeURIComponent(`/shop/${product._id}`)}`);
    return;
    }

    // Products with an image count of 0 (e.g. plain frames) need no photos.
    const requiresPhotos = (product.imagecount ?? 0) > 0;

    if (requiresPhotos) {
      if (uploadedFiles.length === 0) {
        toast.error("Please upload photos");
        return;
      }
      if (uploadedFiles.length < product.imagecount) {
        toast.error(`Please upload exactly ${product.imagecount} photos`);
        return;
      }
    }

    setUploading(true);
    try {
      let imageDataUrls: string[] = [];

      if (requiresPhotos) {
        const compressedFiles = await Promise.all(
          uploadedFiles.map(async (file) => {
            const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
            const filename = `${file.name.replace(/\.[^/.]+$/, "")}.webp`;

            return new File([compressed], filename, {
              type: "image/webp",
              lastModified: file.lastModified,
            });
          }),
        );

        const formData = new FormData();
        compressedFiles.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/upload-r2", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const uploaded = await res.json();
        imageDataUrls = uploaded.urls;
      }

      const cart: CartItem[] = JSON.parse(
        sessionStorage.getItem("cart") || "[]",
      );
      cart.push({
        productId: product._id,
        productName: product.productName,
        price: product.price,
        imageCount: product.imagecount,
        primaryImage: product.primaryImage,
        galleryImages: product.galleryImages,
        uploadedImageUrls: imageDataUrls,
      });
      sessionStorage.setItem("cart", JSON.stringify(cart));
      setCartCount(cart.length);
      setUploadedFiles([]);
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success(
        (t) => (
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-sm">Added to cart! 🛒</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                }}
                className="text-xs px-3 py-1.5 bg-slate-100 rounded-lg font-medium"
              >
                Keep Shopping
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push("/checkout");
                }}
                className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-900 text-white rounded-lg font-medium"
              >
                Go to Checkout
              </button>
            </div>
          </div>
        ),
        { duration: 6000 },
      );
    } catch (err) {
      console.error("Cart error:", err);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-24 sm:pt-28 pb-16 sm:pb-16 md:pb-14 lg:pb-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-8 lg:gap-10 xl:gap-16 animate-pulse">
            {/* ── Left: Image skeleton ── */}
            <div className="space-y-4">
              <div className="h-64 sm:h-80 md:h-[380px] lg:h-[440px] xl:h-[480px] rounded-3xl bg-slate-200" />
              <div className="flex gap-3 p-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-2xl bg-slate-200 flex-shrink-0"
                  />
                ))}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-7 w-28 rounded-full bg-slate-200" />
                ))}
              </div>
            </div>

            {/* ── Right: Info skeleton ── */}
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="h-3 w-24 bg-slate-200 rounded mx-auto lg:mx-0" />
                <div className="h-6 w-3/4 bg-slate-200 rounded mx-auto lg:mx-0" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-5/6 bg-slate-200 rounded mx-auto lg:mx-0" />
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-between gap-4 pt-3 border-t border-slate-100">
                  <div className="flex gap-3">
                    <div className="h-16 w-20 bg-slate-200 rounded-2xl" />
                    <div className="h-16 w-20 bg-slate-200 rounded-2xl" />
                  </div>
                  <div className="h-8 w-24 bg-slate-200 rounded" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-40 bg-slate-200 rounded" />
                  <div className="h-6 w-14 bg-slate-200 rounded-full" />
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full" />
                <div className="h-32 sm:h-40 rounded-2xl bg-slate-200" />
                <div className="h-14 w-full bg-slate-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-blue-50/30 to-white">
        <div className="text-center px-5">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Frame size={36} className="text-blue-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-700">
            Product Not Found
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            This product may have been removed.
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-900 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const maxImages = product.imagecount ?? 0;
  const requiresPhotos = maxImages > 0;
  const uploadProgress = requiresPhotos
    ? Math.round((uploadedFiles.length / maxImages) * 100)
    : 0;
  const productImageUrls = [
    product.primaryImage?.secure_url,
    ...(product.galleryImages || []).map((image) => image?.secure_url),
  ].filter((url): url is string => Boolean(url));

  return (
    <div className="bg-gradient-to-b from-blue-50/30 to-white">
      {/* Consistent left/right padding across all breakpoints */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-20 sm:pt-24 pb-10 sm:pb-12 md:pb-10">
        {/* <div className="flex items-center justify-between mb-8 sm:mb-10">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-900 transition-colors text-sm font-medium group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Shop
          </motion.button>

          {cartCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => router.push("/checkout")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all"
            >
              <ShoppingCart size={15} />
              <span className="hidden xs:inline">Checkout</span>
              <span className="bg-white text-blue-900 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </motion.button>
          )}
        </div> */}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 lg:gap-8 xl:gap-12"
        >
          {/* ── Left: Product Images ── */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="relative h-75 sm:h-72 md:h-[320px] lg:h-[360px] xl:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-50 shadow-xl shadow-blue-100/50">
              {productImageUrls.length > 0 ? (
                <Image
                  src={productImageUrls[selectedImage] || productImageUrls[0]}
                  alt={product.productName}
                  fill
                  className="object-cover transition-all duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Frame size={56} className="text-blue-50" />
                  <p className="text-blue-300 text-sm font-medium">
                    No preview available
                  </p>
                </div>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Only {product.stock} left!
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
                  <span className="bg-white text-slate-700 px-6 py-3 rounded-2xl font-black text-lg shadow-xl">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {productImageUrls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto p-2">
                {productImageUrls.map((imageUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === i
                        ? "border-blue-900 shadow-lg shadow-blue-50/60 scale-105"
                        : "border-slate-200 hover:border-blue-50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={`View ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              {[
                { icon: <Package size={13} />, label: "Premium Quality" },
                { icon: <Truck size={13} />, label: "Fast Delivery" },
                {
                  icon: <CheckCircle2 size={13} />,
                  label: "Satisfaction Guaranteed",
                },
              ].map((f) => (
                <span
                  key={f.label}
                  className="flex items-center gap-1.5 bg-white border border-slate-100 text-slate-500 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm"
                >
                  <span className="text-blue-900">{f.icon}</span>
                  {f.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Product Info + Upload ── */}
          <motion.div variants={fadeUp} className="space-y-5">
            {/* Product header */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm text-center lg:text-left">
              <p className="text-xs text-slate-400 font-mono mb-1">
                {product.productId}
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-3">
                {product.productName}
              </h1>
              {product.description && (
                <div
                  className="text-sm text-slate-500 leading-relaxed prose prose-sm max-w-none mb-4 mx-auto lg:mx-0"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
              <div className="flex flex-wrap items-center lg:items-end justify-center lg:justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="flex gap-3">
                  {requiresPhotos && (
                    <div className="bg-blue-50 rounded-2xl px-4 py-2.5 text-center">
                      <p className="text-xl font-black text-red-600">
                        {product.imagecount}
                      </p>
                      <p className="text-xs text-blue-900 font-medium">Photos</p>
                    </div>
                  )}
                  <div className="bg-teal-50 rounded-2xl px-4 py-2.5 text-center">
                    <p className="text-xl font-black text-red-600">
                      {product.stock}
                    </p>
                    <p className="text-xs text-blue-900 font-medium">
                      In Stock
                    </p>
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-2xl sm:text-3xl font-black text-blue-900">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-xs text-slate-400">per set</p>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
              {requiresPhotos && (
              <>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon size={14} className="text-blue-900" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-700">
                    Upload Your Photos
                  </h2>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    uploadedFiles.length === maxImages
                      ? "bg-blue-100 text-red-600"
                      : "bg-blue-100 text-blue-900"
                  }`}
                >
                  {uploadedFiles.length}/{maxImages}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                <div
                  className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <div
                {...getRootProps({
                  onClick: (event) => {
                    // Guests are sent to the login page instead of opening the file dialog.
                    if (!isLoggedIn()) {
                      event.preventDefault();
                      event.stopPropagation();
                      router.push(`/login?redirect=${encodeURIComponent(`/shop/${id}`)}`);
                    }
                  },
                })}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-blue-900 bg-blue-50 scale-[1.01]"
                    : uploadedFiles.length >= maxImages
                      ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
                      : "border-slate-200 hover:border-blue-50 hover:bg-blue-50/40"
                }`}
              >
                <input
                  {...getInputProps()}
                  disabled={uploadedFiles.length >= maxImages}
                />
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Upload size={22} className="text-blue-900" />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  {!loggedIn
                    ? "Login to upload your photos"
                    : isDragActive
                      ? "Drop your photos here!"
                      : "Drag & drop or click to browse"}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {uploadedFiles.length >= maxImages
                    ? "Maximum photos reached"
                    : `Upload exactly ${maxImages} photos • JPG, PNG, WEBP`}
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="relative group">
                      <div className="relative h-16 rounded-xl overflow-hidden bg-slate-100 ring-2 ring-transparent group-hover:ring-blue-900 transition-all">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              </>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={uploading || product.stock === 0}
                className="mt-5 w-full bg-gradient-to-r from-blue-600 to-blue-900 text-white font-black py-4 px-6 rounded-2xl hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading Photos…
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
