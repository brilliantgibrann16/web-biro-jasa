import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Area internal pengelolaan inquiry Biro Jasa Tiga Saudara.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    noimageindex: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-warm-50 text-accent">{children}</div>;
}
