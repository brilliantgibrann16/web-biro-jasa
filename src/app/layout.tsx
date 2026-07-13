import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import AppChrome from "@/components/layout/AppChrome";
import { COMPANY } from "@/lib/constants";
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
  title: {
    default: "Biro Jasa Tiga Saudara | Pengurusan Dokumen dan Perizinan",
    template: "%s | Biro Jasa Tiga Saudara",
  },
  description:
    "Biro Jasa Tiga Saudara membantu pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis melalui pemeriksaan berkas yang rapi sejak awal.",
  keywords: [
    "biro jasa",
    "pengurusan STNK",
    "pengurusan BPKB",
    "PBG",
    "SLF",
    "perizinan bangunan",
    "ANDALALIN",
    "hak paten",
    "mutasi kendaraan",
    "balik nama kendaraan",
  ],
  authors: [{ name: COMPANY.name }],
  openGraph: {
    title: "Biro Jasa Tiga Saudara",
    description:
      "Pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis dengan pemeriksaan berkas yang jelas.",
    type: "website",
    locale: "id_ID",
    siteName: COMPANY.name,
    images: [
      {
        url: "/opengraph-image",
        alt: "Biro Jasa Tiga Saudara — berkas dibaca dulu, proses dijalankan dengan rapi.",
        width: 1731,
        height: 909,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biro Jasa Tiga Saudara",
    description:
      "Pendamping pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis.",
    images: [
      {
        url: "/twitter-image",
        alt: "Biro Jasa Tiga Saudara — berkas dibaca dulu, proses dijalankan dengan rapi.",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <AppChrome>{children}</AppChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
