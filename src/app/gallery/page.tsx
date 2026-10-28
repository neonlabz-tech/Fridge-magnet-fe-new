"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type GalleryImage = {
  src: string;
  alt: string;
  category: string;
  width: number;
  height: number;
};

const galleryImages: GalleryImage[] = [
    {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8060.HEIC",
    alt: "Birthday gallery photo",
    category: "Birthday",
    width: 1424,
    height: 2532,
  },
    {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8055.JPG.jpeg",
    alt: "Birthday gallery photo",
    category: "Birthday",
    width: 1424,
    height: 2532,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8062.HEIC",
    alt: "Birthday gallery photo",
    category: "Birthday",
    width: 1424,
    height: 2532,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8053.JPG.jpeg",
    alt: "Birthday gallery photo",
    category: "Birthday",
    width: 1424,
    height: 2532,
  },
  {
    src: "/images/product-5.png",
    alt: "Corporate gallery photo",
    category: "Family",
    width: 940,
    height: 650,
  },
  {
    src: "/images/product-4.png",
    alt: "Wedding gallery photo",
    category: "Wedding",
    width: 940,
    height: 650,
  },
  {
    src: "https://images.pexels.com/photos/10821416/pexels-photo-10821416.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Family gallery photo",
    category: "Family",
    width: 940,
    height: 650,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8028.JPG.jpeg",
    alt: "Wedding gallery photo",
    category: "Wedding",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8029.JPG.jpeg",
    alt: "Family gallery photo",
    category: "Family",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8031.JPG.jpeg",
    alt: "Couples gallery photo",
    category: "Couples",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8034.JPG.jpeg",
    alt: "Birthday gallery photo",
    category: "Birthday",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8036.JPG.jpeg",
    alt: "Travel gallery photo",
    category: "Travel",
    width: 1164,
    height: 860,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8037.JPG.jpeg",
    alt: "Wedding gallery photo",
    category: "Wedding",
    width: 2847,
    height: 3796,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8038.JPG.jpeg",
    alt: "Family gallery photo",
    category: "Family",
    width: 1600,
    height: 1142,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8039.JPG.jpeg",
    alt: "Pets gallery photo",
    category: "Family",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8040.JPG.jpeg",
    alt: "Corporate gallery photo",
    category: "Family",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8041.JPG.jpeg",
    alt: "Wedding gallery photo",
    category: "Wedding",
    width: 648,
    height: 761,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8042.JPG.jpeg",
    alt: "Kids gallery photo",
    category: "Family",
    width: 1200,
    height: 1600,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8043.JPG.jpeg",
    alt: "Family gallery photo",
    category: "Family",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8044.JPG.jpeg",
    alt: "Wedding gallery photo",
    category: "Wedding",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8045.JPG.jpeg",
    alt: "Graduation gallery photo",
    category: "Family",
    width: 960,
    height: 1280,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8039.JPG.jpeg",
    alt: "Birthday gallery photo",
    category: "Birthday",
    width: 1424,
    height: 2532,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8047.JPG.jpeg",
    alt: "Travel gallery photo",
    category: "Travel",
    width: 3024,
    height: 4032,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8049.JPG.jpeg",
    alt: "Wedding gallery photo",
    category: "Wedding",
    width: 4032,
    height: 3024,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8050.JPG.jpeg",
    alt: "Kids gallery photo",
    category: "Family",
    width: 2396,
    height: 3197,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8051.JPG.jpeg",
    alt: "Family gallery photo",
    category: "Family",
    width: 3024,
    height: 4032,
  },
  {
    src: "https://pub-57b44696f3e243acb6e5fdb88145606e.r2.dev/gallery_images/IMG_8052.JPG.jpeg",
    alt: "Wedding gallery photo",
    category: "Wedding",
    width: 1440,
    height: 1920,
  },
];

export default function GalleryPage() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = previewIndex !== null ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [previewIndex]);

  const openPreview = (index: number) => setPreviewIndex(index);
  const closePreview = () => setPreviewIndex(null);

  const showPrev = () => {
    setPreviewIndex((index) =>
      index === null
        ? null
        : (index - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const showNext = () => {
    setPreviewIndex((index) =>
      index === null ? null : (index + 1) % galleryImages.length,
    );
  };

  const activeImage =
    previewIndex !== null ? galleryImages[previewIndex] : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1700px] px-4 pt-[70px] sm:px-6 lg:px-[120px]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex min-h-[230px] w-full flex-row items-center gap-4 overflow-hidden sm:min-h-[280px] sm:gap-6 md:min-h-[320px] lg:min-h-[340px] lg:gap-10"
        >
          <div className="relative z-10 flex w-1/2 shrink-0 flex-col justify-center py-5 lg:w-2/5">
            <h1 className="mb-2 text-[25px] font-extrabold leading-tight sm:text-[32px] md:text-[40px] lg:text-[52px]">
              <span className="text-blue-900">Our </span>
              <span className="text-[#D40B0B]">Gallery</span>
            </h1>

            <div className="mb-3 h-[3px] w-10 rounded-full bg-[#D40B0B] sm:w-14" />

            <p className="max-w-[360px] text-[11px] leading-relaxed text-gray-500 sm:text-[13px] md:text-[15px] lg:text-[18px]">
              Explore our collection of beautifully designed fridge magnets and
              frames. Made with love, printed with precision.
            </p>
          </div>

          <div className="relative flex h-[250px] w-1/2 min-w-0 items-center justify-center overflow-hidden sm:h-[300px] md:h-[340px] lg:h-[380px] lg:w-3/5">
            <Image
              src="/gallery.png"
              alt="Gallery hero"
              fill
              priority
              sizes="(max-width: 1024px) 50vw, 60vw"
              className="object-contain object-center"
            />
          </div>
        </motion.section>

        <div className="pb-16">
          {galleryImages.length === 0 ? (
            <p className="py-16 text-center text-gray-400">
              No photos yet.
            </p>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              className="columns-2 gap-2 py-4 sm:columns-3 lg:columns-5"
            >
              {galleryImages.map((image, index) => (
                <motion.div
                  key={`${image.src}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  onClick={() => openPreview(index)}
                  className="group relative mb-2 w-full break-inside-avoid cursor-pointer overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 hover:shadow-lg"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                width={activeImage.width}
                height={activeImage.height}
                sizes="90vw"
                className="max-h-[85vh] max-w-full object-contain"
              />

              <button
                onClick={closePreview}
                aria-label="Close preview"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/40"
              >
                <X size={20} className="text-white" />
              </button>

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={showPrev}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/40"
                  >
                    <ChevronLeft size={22} className="text-white" />
                  </button>

                  <button
                    onClick={showNext}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/40"
                  >
                    <ChevronRight size={22} className="text-white" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}