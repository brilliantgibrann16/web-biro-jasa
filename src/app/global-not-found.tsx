import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import AppChrome from "@/components/layout/AppChrome";
import NotFoundContent from "@/components/page/NotFoundContent";
import { METADATA_BASE } from "@/lib/metadata";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  title: "Halaman Tidak Ditemukan | Biro Jasa Tiga Saudara",
  description:
    "Halaman yang Anda cari tidak tersedia. Kembali ke beranda atau lihat layanan Biro Jasa Tiga Saudara.",
};

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem("tiga-saudara-theme");
      var theme = stored === "light" || stored === "dark"
        ? stored
        : "light";
      document.documentElement.setAttribute("data-theme", theme);
    } catch (_) {
      document.documentElement.setAttribute("data-theme", "light");
    }
  })();
`;

export default function GlobalNotFound() {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jakarta.variable} antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <AppChrome>
            <NotFoundContent />
          </AppChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
