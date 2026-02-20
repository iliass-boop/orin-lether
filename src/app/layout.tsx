import type { Metadata } from 'next';
import { Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SecurityProvider from '@/components/SecurityProvider';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import { ToastProvider } from '@/components/Toast';
import Marquee from '@/components/Marquee';
import PageTransition from '@/components/PageTransition';

// Lazy-load decorative/presentational components — code-split into separate chunks
const CustomCursor = dynamic(() => import('@/components/CustomCursor'));
const FilmGrain = dynamic(() => import('@/components/FilmGrain'));
const Preloader = dynamic(() => import('@/components/Preloader'));

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-accent',
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ORIN — Leather Goods for the Long Haul',
  description:
    'Handcrafted full-grain, vegetable-tanned leather goods. Bags, wallets, and accessories designed to develop character with every carry. Built for decades — not seasons.',
  keywords: ['leather goods', 'handcrafted', 'full-grain leather', 'vegetable-tanned', 'luxury bags', 'wallets', 'belts'],
  authors: [{ name: 'ORIN' }],
  creator: 'ORIN',
  openGraph: {
    title: 'ORIN — Leather Goods for the Long Haul',
    description: 'Handcrafted full-grain, vegetable-tanned leather goods designed to last decades.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ORIN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORIN — Leather Goods for the Long Haul',
    description: 'Handcrafted full-grain leather goods. Built for decades.',
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${cormorant.variable}`}>
      <body>
        <Preloader />
        <SecurityProvider>
          <SmoothScrollProvider>
            <ToastProvider>
              <CustomCursor />
              <FilmGrain />
              <Marquee />
              <Navbar />
              <CartDrawer />
              <PageTransition>
                <main>{children}</main>
              </PageTransition>
              <Footer />
            </ToastProvider>
          </SmoothScrollProvider>
        </SecurityProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ORIN',
              url: 'https://orin.com',
              logo: 'https://orin.com/logo.png',
              description: 'Handcrafted full-grain, vegetable-tanned leather goods designed to last decades.',
              foundingDate: '2024',
              founders: [
                {
                  '@type': 'Person',
                  name: 'ORIN Founder',
                },
              ],
              sameAs: [
                'https://instagram.com/orin',
                'https://twitter.com/orin',
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
