"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, ChevronDown, MessageCircleMore } from "lucide-react";
import { useRef, useState } from "react";
import { COMPANY, FAQ_ITEMS, WHATSAPP_MESSAGES } from "@/lib/constants";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="faq"
      ref={ref}
      className="relative overflow-hidden bg-page py-24 md:py-36"
      aria-label="Pertanyaan yang sering diajukan"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
          <motion.div
            className="lg:sticky lg:top-28 lg:self-start"
            initial={{ y: 24 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-primary">
              FAQ
            </p>
            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-[1.04] text-accent sm:text-5xl">
              Informasi penting sebelum Anda memulai pengurusan.
            </h2>
            <p className="mt-7 max-w-md text-base leading-8 text-neutral-500">
              Jawaban berikut memberi gambaran umum. Persyaratan dan proses akhir
              tetap ditentukan setelah kondisi dokumen diperiksa.
            </p>

            <a
              href={COMPANY.whatsappUrl(WHATSAPP_MESSAGES.faq)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-3 border-b border-primary pb-2 text-sm font-extrabold text-primary transition-colors hover:text-primary-dark"
            >
              <MessageCircleMore className="h-5 w-5" />
              Tanyakan via WhatsApp
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>

          <div className="border-y border-neutral-200">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openIndex === i;

              return (
                <motion.article
                  key={item.question}
                  className="border-b border-neutral-200 last:border-b-0"
                  initial={{ y: 16 }}
                  animate={isInView ? { y: 0 } : {}}
                  transition={{
                    duration: 0.45,
                    delay: 0.12 + i * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <h3>
                    <button
                      id={`faq-question-${i}`}
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="grid w-full grid-cols-[3.2rem_minmax(0,1fr)_2.75rem] items-start gap-3 py-6 text-left md:grid-cols-[4rem_minmax(0,1fr)_3rem] md:gap-5"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                    >
                      <span className={`font-display text-3xl font-black leading-none transition-colors ${
                        isOpen ? "text-primary" : "text-neutral-400"
                      }`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="max-w-3xl text-lg font-extrabold leading-snug text-accent md:text-xl">
                        {item.question}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="grid h-10 w-10 place-items-center border border-neutral-200 text-primary"
                        aria-hidden="true"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>
                  </h3>

                  <motion.div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    aria-hidden={!isOpen}
                    initial={false}
                    animate={
                      isOpen
                        ? { height: "auto", opacity: 1 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl pb-7 pl-[4.05rem] text-sm leading-7 text-neutral-500 md:ml-20 md:pl-0 md:text-base md:leading-8">
                      {item.answer}
                    </p>
                  </motion.div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
