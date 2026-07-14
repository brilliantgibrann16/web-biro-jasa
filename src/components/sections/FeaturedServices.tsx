"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { FEATURED_SERVICES } from "@/lib/constants";

export default function FeaturedServices() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });
  const [leadService, secondaryService, ...supportingServices] = FEATURED_SERVICES;
  const LeadIcon = leadService.icon;
  const SecondaryIcon = secondaryService.icon;

  return (
    <section
      id="layanan"
      ref={ref}
      className="relative overflow-hidden bg-page py-24 md:py-36"
      aria-label="Layanan unggulan"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-neutral-200" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-16 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
          <motion.div
            initial={{ y: 24 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-primary">
              Layanan utama
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] text-accent sm:text-5xl lg:text-6xl">
              Tiga kategori layanan untuk kebutuhan administrasi yang berbeda.
            </h2>
          </motion.div>

          <motion.p
            className="max-w-xl text-base leading-8 text-neutral-500 lg:justify-self-end"
            initial={{ y: 24 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Pilih kategori berdasarkan dokumen yang ingin diurus. Setiap halaman
            menjelaskan cakupan layanan, dokumen awal, dan fokus prosesnya.
          </motion.p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-7"
            initial={{ y: 32 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.72, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={leadService.href}
              className="group relative flex min-h-[520px] overflow-hidden border border-neutral-200 bg-panel p-8 text-accent transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 md:p-10"
            >
              <div className="relative flex min-h-full flex-1 flex-col">
                <div className="flex items-start justify-between gap-8">
                  <LeadIcon className="h-8 w-8 text-primary" aria-hidden="true" />
                  <span
                    className="font-display text-8xl font-black leading-none text-neutral-400"
                    aria-hidden="true"
                  >
                    01
                  </span>
                </div>

                <div className="mt-auto max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                    {leadService.scope}
                  </p>
                  <h3 className="mt-5 font-display text-4xl font-semibold leading-[1.02] sm:text-6xl">
                    {leadService.title}
                  </h3>
                  <p className="mt-6 max-w-xl text-base leading-8 text-neutral-500">
                    {leadService.description}
                  </p>
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6">
                  <span className="text-sm font-bold text-neutral-500">
                    Lihat detail layanan
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-extrabold text-primary">
                    Buka
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={{ y: 32 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.72, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={secondaryService.href}
              className="group flex min-h-[520px] flex-col border border-neutral-200 bg-panel p-8 text-accent transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 md:p-10"
            >
              <div className="flex items-start justify-between gap-8">
                <SecondaryIcon className="h-8 w-8 text-primary" aria-hidden="true" />
                <span className="font-display text-7xl font-black leading-none text-neutral-400">
                  02
                </span>
              </div>

              <div className="mt-auto">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                  {secondaryService.scope}
                </p>
                <h3 className="mt-5 font-display text-3xl font-semibold leading-[1.05] sm:text-5xl">
                  {secondaryService.title}
                </h3>
                <p className="mt-6 text-base leading-8 text-neutral-500">
                  {secondaryService.description}
                </p>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6">
                <span className="text-sm font-bold text-neutral-500">
                  Lihat detail layanan
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-extrabold text-primary">
                  Buka
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 border-y border-neutral-200"
          initial={{ y: 22 }}
          animate={isInView ? { y: 0 } : {}}
          transition={{ duration: 0.66, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {supportingServices.map((service, index) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.title}
                href={service.href}
                className="group grid gap-5 border-b border-neutral-200 py-6 last:border-b-0 md:grid-cols-[4rem_minmax(0,0.78fr)_minmax(0,1fr)_auto] md:items-center"
              >
                <span className="font-display text-3xl font-black leading-none text-neutral-400 transition-colors duration-300 group-hover:text-primary">
                  {String(index + 3).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="text-lg font-extrabold text-accent transition-colors duration-300 group-hover:text-primary">
                    {service.title}
                  </h3>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-neutral-500">
                  {service.description}
                </p>
                <ArrowRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
