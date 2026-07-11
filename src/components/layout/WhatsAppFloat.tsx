"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/constants";

export default function WhatsAppFloat() {
  const reduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 560);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50 hidden md:block"
      initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <a
        href={COMPANY.whatsappUrl(COMPANY.defaultWhatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi kami via WhatsApp"
        className="group relative grid h-14 w-14 place-items-center rounded-sm border border-primary/20 bg-primary text-white shadow-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark"
      >
        <MessageCircle className="relative z-10 h-6 w-6" />
        <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded-sm bg-ink px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100 lg:block">
          Bicarakan berkas
        </span>
      </a>
    </motion.div>
  );
}
