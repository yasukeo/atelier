import type { Metadata } from "next";
import { Aref_Ruqaa, Gloock, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from 'next/link'
import CartButton from '@/components/CartButton'
import Image from 'next/image'
import { InstagramIcon, FacebookIcon, TikTokIcon } from '@/components/icons'
import { FooterAccountLinks, HeaderAccount, Providers } from '@/components/SessionNav'
import { SiteNav } from '@/components/SiteNav'

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

// Display face: titles and painting names
const gloock = Gloock({
  variable: "--font-gloock",
  weight: "400",
  subsets: ["latin"],
});

// Calligraphic Arabic for the الورشة wordmark, close to the logo's brush lettering
const ruqaa = Aref_Ruqaa({
  variable: "--font-ruqaa",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

const SOCIALS = [
  { href: 'https://www.instagram.com/el.warcha/', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://www.facebook.com/profile.php?id=61581883214871', label: 'Facebook', Icon: FacebookIcon },
  { href: 'https://www.tiktok.com/@elwarcha.com', label: 'TikTok', Icon: TikTokIcon },
]

export const metadata: Metadata = {
  metadataBase: new URL('https://www.elwarcha.com'),
  title: {
    default: "Elwarcha | الورشة - Galerie d'art marocain",
    template: '%s | Elwarcha',
  },
  description: "Découvrez des œuvres d'art uniques et des recréations sur mesure. Peintures originales, art marocain, tableaux faits main. Livraison au Maroc et à l'international.",
  keywords: [
    'elwarcha', 'الورشة', 'peinture', 'tableau', 'art marocain', 'galerie art',
    'peinture marocaine', 'art en ligne', 'acheter tableau', 'painting', 'moroccan art',
    'handmade painting', 'buy art online', 'galerie peinture maroc',
    'toile peinte', 'décoration murale', 'art contemporain maroc',
  ],
  authors: [{ name: 'Elwarcha' }],
  creator: 'Elwarcha',
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://www.elwarcha.com',
    siteName: 'Elwarcha | الورشة',
    title: "Elwarcha | الورشة - Galerie d'art marocain",
    description: "Découvrez des œuvres d'art uniques et des recréations sur mesure. Peintures originales, art marocain, tableaux faits main.",
    images: [
      {
        url: '/logos/Plan de travail 11.png',
        width: 1200,
        height: 630,
        alt: 'Elwarcha - الورشة',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Elwarcha | الورشة - Galerie d'art marocain",
    description: "Découvrez des œuvres d'art uniques et des recréations sur mesure. Peintures originales, art marocain.",
    images: ['/logos/Plan de travail 11.png'],
  },
  alternates: {
    canonical: 'https://www.elwarcha.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'P4s8nB2TnZ5e0a2H79USI12eFsq1scNnkr6M1hiNX9M',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${hanken.variable} ${gloock.variable} ${ruqaa.variable} antialiased min-h-screen flex flex-col bg-chaux text-encre`}>
        <Providers>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-encre focus:text-chaux focus:px-4 focus:py-2 focus:text-sm">
          Aller au contenu
        </a>
        <header className="sticky top-0 z-50 w-full border-b border-trait bg-chaux/90 backdrop-blur-md">
          <div className="max-w-[88rem] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
            <Link href="/" className="group flex items-center gap-2.5 shrink-0" aria-label="Elwarcha, accueil">
              <Image src="/logos/icone (1).png" alt="" width={31} height={34} className="h-[34px] w-auto transition-transform duration-700 group-hover:rotate-45" priority />
              <span className="font-display text-[22px] leading-none text-encre">Elwarcha</span>
              <span lang="ar" dir="rtl" className="hidden sm:inline font-arabic text-[22px] leading-none text-grenat translate-y-[2px]">الورشة</span>
            </Link>

            <SiteNav />

            <div className="flex items-center gap-4 sm:gap-5">
              <CartButton />
              <HeaderAccount />
            </div>
          </div>
        </header>
        <main id="contenu" className="flex-1">{children}</main>
        <footer className="bg-nuit text-sable/80">
          <div className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-16 pb-10">
            <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div className="space-y-4">
                <p lang="ar" dir="rtl" className="font-arabic text-6xl leading-none text-sable text-left">الورشة</p>
                <p className="text-sm leading-relaxed max-w-xs">
                  Elwarcha — « l&apos;atelier » en arabe. Tableaux originaux peints à la main au Maroc.
                </p>
              </div>
              <nav aria-label="Boutique" className="space-y-3 text-sm">
                <p className="eyebrow text-sable/70">Boutique</p>
                <ul className="space-y-2">
                  <li><Link href="/paintings" className="hover:text-white transition-colors">Galerie</Link></li>
                  <li><Link href="/paintings?kind=UNIQUE" className="hover:text-white transition-colors">Pièces uniques</Link></li>
                  <li><Link href="/paintings?kind=RECREATABLE" className="hover:text-white transition-colors">Re-créations</Link></li>
                  <li><Link href="/about" className="hover:text-white transition-colors">L&apos;atelier</Link></li>
                </ul>
                <FooterAccountLinks />
              </nav>
              <nav aria-label="Aide" className="space-y-3 text-sm">
                <p className="eyebrow text-sable/70">Aide</p>
                <ul className="space-y-2">
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/shipping" className="hover:text-white transition-colors">Expédition</Link></li>
                  <li><Link href="/refund" className="hover:text-white transition-colors">Remboursement</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Conditions</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
                </ul>
              </nav>
              <div className="space-y-3 text-sm">
                <p className="eyebrow text-sable/70">Suivre l&apos;atelier</p>
                <ul className="space-y-2">
                  {SOCIALS.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-14 pt-6 border-t border-sable/15 flex flex-wrap items-center justify-between gap-3 text-xs text-sable/70">
              <p>© {new Date().getFullYear()} Elwarcha. Tous droits réservés.</p>
              <p>Livraison partout au Maroc</p>
            </div>
          </div>
        </footer>
        <Toaster closeButton position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
