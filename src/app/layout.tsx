import type { Metadata, Viewport } from "next";
import { Heebo, Jost } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Toast } from "@/components/layout/Toast";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { site } from "@/data/site";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-latin", display: "swap" });
const heebo = Heebo({ subsets: ["hebrew", "latin"], weight: ["300", "400", "500", "700"], variable: "--font-hebrew", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — בגדי מעצבים ונעלי יוקרה`, template: `%s | ${site.name}` },
  description: `${site.bio.welcome}. ${site.bio.promise} ${site.voice.shipping}`,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} — בגדי מעצבים ונעלי יוקרה`,
    description: site.bio.promise,
    images: [{ url: "/images/ig/Dba4VIEDaYU-06.jpg", width: 768, height: 1024, alt: "SUPERNOVA" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${jost.variable} ${heebo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <StoreProvider>
          <a href="#main" className="skip-link">
            דלג לתוכן
          </a>
          <AnnouncementBar />
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <MobileMenu />
          <SearchOverlay />
          <CartDrawer />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
