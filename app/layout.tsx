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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elwarcha | الورشة - Galerie d'art marocain",
  description: "Découvrez des œuvres d'art uniques et des recréations sur mesure. Galerie en ligne et atelier d'art marocain.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#F7F5F0]`}>        
        <header className="sticky top-0 z-50 w-full border-b border-[#DCD9CC] bg-[#F7F5F0]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logos/icone (1).png" alt="Elwarcha" width={36} height={36} />
              <span className="text-base font-semibold tracking-tight text-[#6B2D2D]">Elwarcha</span>
            </Link>
            <nav className="flex items-center gap-4 text-xs text-[#8B7355]">
              <a href="/paintings" className="hover:text-[#6B2D2D]">Galerie</a>
              <a href="/about" className="hover:text-[#6B2D2D]">À propos</a>
              {session?.user && (
                <a href="/orders" className="hover:text-[#6B2D2D]">Mes commandes</a>
              )}
            </nav>
            <div className="flex items-center gap-4">
              <CartButton />
              <AuthActions session={(session?.user as { email?: string; role?: string }) ?? null} variant="bar" />
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#D8D5C8] bg-[#E9E7DB]">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col items-center gap-6">
            <Image src="/logos/Plan de travail 11.png" alt="Elwarcha الورشة" width={140} height={100} className="object-contain" />
            <nav className="flex items-center gap-6 text-xs text-[#8B7355]">
              <a href="/paintings" className="hover:text-[#6B2D2D]">Galerie</a>
              <a href="/about" className="hover:text-[#6B2D2D]">À propos</a>
              <a href="/contact" className="hover:text-[#6B2D2D]">Contact</a>
            </nav>
            <p className="text-xs text-[#8B7355]">© {new Date().getFullYear()} Elwarcha. Tous droits réservés.</p>
          </div>
        </footer>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}
