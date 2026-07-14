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
      className="relative bg-page py-12 md:py-16"
      aria-labelledby="trust-indicators-title"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="border-y border-neutral-200">
          <header className="grid border-b border-neutral-200 sm:grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)] sm:items-center">
            <div className="flex items-center justify-between gap-5 border-b border-neutral-200 py-4 sm:block sm:border-b-0 sm:border-r sm:py-7 sm:pr-8">
              <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-primary">
                Standar kerja
              </p>
              <span
                className="font-display text-2xl font-semibold text-neutral-400 sm:mt-3 sm:block"
                aria-hidden="true"
              >
                01—{String(TRUST_ITEMS.length).padStart(2, "0")}
              </span>
            </div>
            <h2
              id="trust-indicators-title"
              className="max-w-4xl py-6 text-xl font-semibold leading-8 text-accent sm:py-7 sm:pl-8 sm:text-2xl sm:leading-9 lg:pl-12"
            >
              Setiap pengurusan perlu menjelaskan dokumen yang dibutuhkan,
              tahapan proses, dan hasil yang diterima.
            </h2>
          </header>

          <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((item, i) => (
              <motion.li
                key={item.label}
                className="group border-b border-neutral-200 py-6 last:border-b-0 sm:px-7 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
                initial={{ y: 12 }}
                animate={isInView ? { y: 0 } : {}}
                transition={{
                  duration: 0.52,
                  delay: i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="mb-5 flex items-center gap-3" aria-hidden="true">
                  <span className="text-[0.62rem] font-black tracking-[0.16em] text-primary-dark">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px w-10 bg-primary/45 transition-all duration-300 group-hover:w-16" />
                </div>
                <h3 className="text-base font-extrabold text-accent">
                  {item.label}
                </h3>
                <p className="mt-2 max-w-[16rem] text-sm leading-7 text-neutral-500">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
