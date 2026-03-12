import ProductsFilter from '@/components/ProductsFilter';
import { getProducts } from '@/lib/data/products';
import { Metadata } from 'next';

export const revalidate = 3600; // ISR cache for 1 hour

export const metadata: Metadata = {
    title: 'The Collection | Orin Leather',
    description: 'Explore our collection of full-grain vegetable-tanned leather bags, wallets, and accessories. Built to last for decades, not seasons.',
    openGraph: {
        title: 'The Collection | Orin Leather',
        description: 'Explore our collection of full-grain vegetable-tanned leather bags, wallets, and accessories.',
        url: 'https://orinleather.com/products',
        siteName: 'Orin Leather',
        images: [
            {
                url: '/images/products/drifter_hero_1771640197945.png',
                width: 1200,
                height: 630,
                alt: 'Orin Leather Collection',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'The Collection | Orin Leather',
        description: 'Explore our collection of full-grain vegetable-tanned leather bags, wallets, and accessories.',
        images: ['/images/products/drifter_hero_1771640197945.png'],
    },
};

export default async function ProductsPage() {
    const products = await getProducts();
    
    return <ProductsFilter initialProducts={products} />;
}
