import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  {
    href: "https://web.facebook.com/MagnifyMagnets",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/magnify_creations/",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@magnify_creations",
    label: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-white text-slate-900 border-t border-slate-200">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile/Tablet: 2 cols (logo full, links side by side, map full). Desktop: 4 cols */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <div className="relative lg:-ml-3 mt-[-40px] mb-[-40px] h-[110px] w-[190px] sm:h-[150px] sm:w-[250px] sm:mt-[-55px] sm:mb-[-50px]">
                <Image
                  src="/logo.png"
                  alt="Magnify Logo"
                  fill
                  priority
                  className="object-contain object-center lg:object-left"
                  sizes="(max-width: 640px) 190px, 250px"
                />
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Premium photo framing for curated memories.
            </p>

            {/* Social icons */}
            <div className="mt-4 flex items-center justify-center lg:justify-start gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-blue-900 hover:bg-blue-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Useful Links */}
          <div className="col-span-1 text-center lg:text-left">
            <h3 className="font-bold text-sm uppercase tracking-wider text-blue-900 mb-4">
              Useful Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/gallery", label: "Gallery" },
                { href: "/shop", label: "Gift" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-blue-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="col-span-1 text-center lg:text-left">
            <h3 className="font-bold text-sm uppercase tracking-wider text-blue-900 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms-of-service", label: "Terms of Service" },
                { href: "/shipping", label: "Shipping Policy" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-blue-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit Us - Google Map */}
          <div className="col-span-2 lg:col-span-1 text-center lg:text-left">
            <h3 className="font-bold text-sm uppercase tracking-wider text-blue-900 mb-4">
              Visit Us
            </h3>
            <div className="relative w-full h-[150px] sm:h-[180px] lg:h-[120px] bg-slate-100 rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.8305814987602!2d80.01146597478936!3d9.695496890394892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afe552ffb6c417d%3A0x427b75dc7b4e8b5a!2sMagnify%20creations!5e0!3m2!1sen!2slk!4v1788234300408!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0, position: "absolute", top: 0, left: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Magnify Creations Location"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 text-center sm:text-left">
            <p>© 2026 Magnify Photo Frames. Curated Memories.</p>
            <p>
              Developed by{" "}
              <a
                href="https://theneonlabz.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-900 font-semibold hover:underline"
              >
                NeonLabz (Pvt) Ltd.
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}