import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthActions } from '@/components/AuthActions'
import Link from 'next/link'
import CartButton from '@/components/CartButton'
import Image from 'next/image'
import { InstagramIcon, FacebookIcon, TikTokIcon } from '@/components/icons'
import type { Session } from 'next-auth'
import { MobileNav } from '@/components/MobileNav'
import { Suspense } from 'react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let session: Session | null = null
  try {
    session = await getServerSession(authOptions)
  } catch {
    // Graceful fallback: show page as logged-out rather than crashing
  }
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#F7F5F0]`}>        
        <header className="sticky top-0 z-50 w-full border-b border-[#DCD9CC] bg-[#F7F5F0]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image src="/logos/icone (1).png" alt="Elwarcha" width={36} height={36} />
              <span className="text-base font-semibold tracking-tight text-[#6B2D2D]">Elwarcha</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm text-[#8B7355]">
              <a href="/paintings" className="hover:text-[#6B2D2D] transition-colors">Galerie</a>
              <a href="/about" className="hover:text-[#6B2D2D] transition-colors">À propos</a>
              <a href="/contact" className="hover:text-[#6B2D2D] transition-colors">Contact</a>
              {session?.user && (
                <a href="/orders" className="hover:text-[#6B2D2D] transition-colors">Mes commandes</a>
              )}
            </nav>
            
            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <CartButton />
              <div className="hidden md:flex">
                <Suspense>
                  <AuthActions session={(session?.user as { email?: string; role?: string }) ?? null} variant="bar" />
                </Suspense>
              </div>
              {/* Mobile Menu */}
              <Suspense>
                <MobileNav session={(session?.user as { email?: string; role?: string }) ?? null} />
              </Suspense>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#D8D5C8] bg-[#E9E7DB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Mobile: Stack vertically, Desktop: Grid layout */}
            <div className="flex flex-col items-center gap-8">
              {/* Logo */}
              <Image src="/logos/Plan de travail 11.png" alt="Elwarcha الورشة" width={120} height={86} className="object-contain" />
              
              {/* Main Navigation */}
              <nav className="flex items-center gap-4 sm:gap-6 text-sm text-[#8B7355]">
                <a href="/paintings" className="hover:text-[#6B2D2D] transition-colors">Galerie</a>
                <a href="/about" className="hover:text-[#6B2D2D] transition-colors">À propos</a>
                <a href="/contact" className="hover:text-[#6B2D2D] transition-colors">Contact</a>
              </nav>

              {/* Account Links */}
              {session?.user && (
                <nav className="flex items-center gap-4 sm:gap-6 text-sm text-[#8B7355]">
                  <a href="/profile" className="hover:text-[#6B2D2D] transition-colors">Mon profil</a>
                  <a href="/orders" className="hover:text-[#6B2D2D] transition-colors">Mes commandes</a>
                </nav>
              )}
              
              {/* Social Links */}
              <div className="flex items-center gap-5">
                <a href="https://www.instagram.com/el.warcha/" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-[#6B2D2D] transition-colors p-2" aria-label="Instagram">
                  <InstagramIcon className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61581883214871" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-[#6B2D2D] transition-colors p-2" aria-label="Facebook">
                  <FacebookIcon className="w-6 h-6" />
                </a>
                <a href="https://www.tiktok.com/@elwarcha.com" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-[#6B2D2D] transition-colors p-2" aria-label="TikTok">
                  <TikTokIcon className="w-6 h-6" />
                </a>
              </div>
              
              {/* Policy Links - Grid on mobile for better readability */}
              <nav className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4 text-xs text-[#8B7355] text-center">
                <a href="/privacy" className="hover:text-[#6B2D2D] transition-colors py-1">Confidentialité</a>
                <a href="/refund" className="hover:text-[#6B2D2D] transition-colors py-1">Remboursement</a>
                <a href="/terms" className="hover:text-[#6B2D2D] transition-colors py-1">Conditions</a>
                <a href="/shipping" className="hover:text-[#6B2D2D] transition-colors py-1">Expédition</a>
              </nav>
              
              {/* Copyright */}
              <p className="text-xs text-[#8B7355] text-center">© {new Date().getFullYear()} Elwarcha. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}
