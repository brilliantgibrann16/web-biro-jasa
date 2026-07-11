"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { COMPANY, NAV_ITEMS } from "@/lib/constants";
import { ThemeToggle } from "@/lib/theme";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const LIGHT_OPENING_PATHS = new Set([
  "/layanan",
  "/proses",
  "/tentang",
  "/faq",
]);

interface BackgroundElementState {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const hasDarkOpening = !LIGHT_OPENING_PATHS.has(pathname);
  const onDarkHero = hasDarkOpening && !isScrolled && !isMobileOpen;

  const headerTextClass = useMemo(
    () => (onDarkHero ? "text-white" : "text-accent"),
    [onDarkHero]
  );

  const headerMutedClass = useMemo(
    () => (onDarkHero ? "text-white/74 hover:text-white" : "text-neutral-600 hover:text-accent"),
    [onDarkHero]
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeMobileMenu();
    };

    desktopQuery.addEventListener("change", handleDesktopChange);
    return () => desktopQuery.removeEventListener("change", handleDesktopChange);
  }, [closeMobileMenu]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const dialog = mobileDialogRef.current;
    if (!dialog) return;

    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    const backgroundStates: BackgroundElementState[] = [];

    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    for (const child of Array.from(document.body.children)) {
      if (
        !(child instanceof HTMLElement) ||
        child.contains(dialog) ||
        child.tagName === "SCRIPT" ||
        child.tagName === "STYLE"
      ) {
        continue;
      }

      backgroundStates.push({
        element: child,
        inert: child.inert,
        ariaHidden: child.getAttribute("aria-hidden"),
      });
      child.inert = true;
      child.setAttribute("aria-hidden", "true");
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !dialog.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (activeElement === lastElement || !dialog.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;

      for (const state of backgroundStates) {
        state.element.inert = state.inert;
        if (state.ariaHidden === null) {
          state.element.removeAttribute("aria-hidden");
        } else {
          state.element.setAttribute("aria-hidden", state.ariaHidden);
        }
      }

      window.requestAnimationFrame(() => menuButton?.focus());
    };
  }, [closeMobileMenu, isMobileOpen]);

  const isActivePath = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-neutral-200/80 bg-paper/94 py-3 shadow-soft backdrop-blur-md"
            : "bg-transparent py-5"
        } ${onDarkHero ? "focus-surface-dark" : ""}`}
        initial={{ y: -96 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8"
          aria-label="Navigasi utama"
        >
          <Link
            href="/"
            className="relative z-10 flex items-center gap-3.5"
            aria-label="Tiga Saudara - Beranda"
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-sm border text-sm font-black transition-colors duration-300 ${
                onDarkHero
                  ? "border-primary-light/40 bg-primary-light/10 text-primary-light"
                  : "border-primary/30 bg-primary/8 text-primary"
              }`}
            >
              TS
            </span>
            <span className={`leading-none transition-colors duration-300 ${headerTextClass}`}>
              <span className="block text-[0.95rem] font-extrabold uppercase tracking-[0.04em]">
                Tiga Saudara
              </span>
              <span className="mt-1 hidden text-[0.68rem] font-semibold uppercase tracking-[0.16em] opacity-60 sm:block">
                Pendampingan Dokumen
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`animated-underline text-[0.82rem] font-bold uppercase tracking-[0.08em] transition-colors duration-300 ${
                    isActive
                      ? onDarkHero
                        ? "text-white"
                        : "text-primary"
                      : headerMutedClass
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div
            className={`hidden items-center gap-4 transition-colors duration-300 lg:flex ${
              onDarkHero ? "text-white" : "text-accent"
            }`}
          >
            <ThemeToggle />
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className={`hidden text-[0.82rem] font-bold transition-colors xl:inline ${
                onDarkHero ? "text-white/68 hover:text-white" : "text-neutral-500 hover:text-accent"
              }`}
            >
              {COMPANY.phone}
            </a>
            <a
              href={COMPANY.whatsappUrl(COMPANY.defaultWhatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-[0.82rem] font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              Bicarakan Berkas
            </a>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMobileOpen((value) => !value)}
            className={`relative z-10 rounded-sm border border-current/10 p-2.5 transition-colors duration-300 lg:hidden ${headerTextClass}`}
            aria-label={isMobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav"
            aria-haspopup="dialog"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence initial={false}>
        {isMobileOpen && (
          <motion.div
            ref={mobileDialogRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
            data-mobile-drawer-root
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <motion.div
              className="absolute inset-0 bg-ink/72 backdrop-blur-sm"
              onClick={closeMobileMenu}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.nav
              className="absolute bottom-0 right-0 top-0 flex w-[88%] max-w-sm flex-col overflow-hidden bg-paper text-accent shadow-elevated"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              aria-label="Navigasi mobile"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-7 py-5">
                <h2
                  id="mobile-nav-title"
                  className="text-sm font-black uppercase tracking-[0.16em] text-accent"
                >
                  Menu utama
                </h2>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={closeMobileMenu}
                    className="grid h-10 w-10 place-items-center rounded-sm border border-neutral-200 text-accent transition-colors hover:border-primary/40 hover:text-primary"
                    aria-label="Tutup menu"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-7 py-6">
                <div className="space-y-1">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`block border-b border-neutral-100 py-4 text-lg font-semibold transition-colors hover:text-primary ${
                          isActivePath(item.href) ? "text-primary" : "text-accent"
                        }`}
                        aria-current={isActivePath(item.href) ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 border-l border-primary/35 pl-4 text-accent">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Kontak
                  </p>
                  <p className="mt-2 text-sm font-semibold text-neutral-600">
                    {COMPANY.phone}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {COMPANY.hours}
                  </p>
                </div>
              </div>

              <div className="p-7">
                <a
                  href={COMPANY.whatsappUrl(COMPANY.defaultWhatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 font-bold text-white transition-all hover:bg-primary-dark"
                >
                  <MessageCircle className="h-5 w-5" />
                  Bicarakan Berkas
                </a>
                <p className="mt-4 text-center text-sm text-neutral-500">
                  {COMPANY.hours}
                </p>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
