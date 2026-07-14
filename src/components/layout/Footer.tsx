import {
  ArrowUp,
  ArrowUpRight,
  Clock3,
  MessageCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { COMPANY, NAV_ITEMS, SERVICE_CATEGORIES } from "@/lib/constants";
import { CUSTOMER_NAV_ITEMS } from "@/lib/public-navigation";

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-site-footer text-accent"
      role="contentinfo"
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(184,100,42,0.1),transparent_34%)]" />
      <div className="noise absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 border-y border-site-chrome-line py-16 md:py-20 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.72fr)_minmax(0,0.72fr)] lg:gap-16">
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              Biro Jasa Tiga Saudara
            </p>
            <h2 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight text-accent sm:text-5xl">
              Konsultasikan kebutuhan sebelum pengurusan dimulai.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
              Kami membantu memeriksa persyaratan, menyusun tahapan, dan
              mendampingi pengurusan melalui instansi yang berwenang.
            </p>

            <a
              href={COMPANY.whatsappUrl(COMPANY.defaultWhatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-3 rounded-sm bg-primary px-5 py-3 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              Konsultasi via WhatsApp
            </a>
          </div>

          <nav aria-labelledby="footer-navigation-heading">
            <h2 id="footer-navigation-heading" className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-neutral-500">
              Navigasi
            </h2>
            <ul className="mt-6 space-y-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-primary-dark"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary/0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                  </Link>
                </li>
              ))}
              {CUSTOMER_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-primary-dark"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary/0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-heading">
            <h2 id="footer-contact-heading" className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-neutral-500">
              Kontak
            </h2>
            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-primary-dark" aria-hidden="true" />
                <p className="text-sm font-semibold text-neutral-700">
                  {COMPANY.phone}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-1 h-4 w-4 text-primary-dark" aria-hidden="true" />
                <p className="text-sm leading-7 text-neutral-600">
                  {COMPANY.hours}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map((service) => (
                <Link
                  key={service.id}
                  href={`/layanan/${service.slug}`}
                  className="border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 transition-colors duration-300 hover:border-primary/35 hover:text-primary-dark"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-5 py-6 text-xs text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {COMPANY.year} {COMPANY.name}. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/privasi"
              className="font-semibold text-neutral-600 transition-colors duration-200 hover:text-primary-dark"
            >
              Pemberitahuan privasi
            </Link>
            <a
              href="#"
              className="group inline-flex items-center gap-2 text-neutral-600 transition-colors duration-200 hover:text-primary-dark"
              aria-label="Kembali ke atas"
            >
              Kembali ke atas
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
