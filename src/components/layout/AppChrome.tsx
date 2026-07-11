"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isContact = pathname === "/kontak";

  return (
    <>
      <a href="#main-content" className="skip-link">
        Langsung ke konten utama
      </a>
      {!isAdmin && <Navbar />}
      <main
        id="main-content"
        className={isAdmin ? "min-h-screen flex-1 bg-warm-50" : "flex-1"}
        tabIndex={-1}
      >
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && !isContact && <WhatsAppFloat />}
    </>
  );
}
