"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TRUST_ITEMS } from "@/lib/constants";

export default function TrustIndicators() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className="relative bg-paper py-12 md:py-16"
      aria-label="Indikator kepercayaan"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="border-y border-neutral-200">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
            <div className="border-b border-neutral-200 py-7 lg:border-b-0 lg:border-r lg:pr-12">
              <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-primary">
                Standar kerja
              </p>
              <p className="mt-3 max-w-md text-xl font-semibold leading-8 text-accent">
                Dokumen yang baik bukan hanya selesai. Asal berkas, syarat,
                status, dan penyerahannya harus bisa dijelaskan.
              </p>
            </div>

            <div className="grid gap-0 sm:grid-cols-2">
            {TRUST_ITEMS.map((item, i) => (
              <motion.article
                key={item.label}
                className="group border-b border-neutral-200 py-6 last:border-b-0 sm:odd:border-r sm:px-7 sm:last:border-b lg:[&:nth-last-child(-n+2)]:border-b-0"
                initial={{ y: 16 }}
                animate={isInView ? { y: 0 } : {}}
                transition={{
                  duration: 0.52,
                  delay: i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="mb-4 h-px w-10 bg-primary/45 transition-all duration-300 group-hover:w-16" />
                <h2 className="text-base font-extrabold text-accent">
                  {item.label}
                </h2>
                <p className="mt-2 max-w-[16rem] text-sm leading-7 text-neutral-500">
                  {item.description}
                </p>
              </motion.article>
            ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
