import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProductById, getProducts } from '@/lib/data/products';

export const revalidate = 3600; // ISR cache for 1 hour

// Build-time static generation for all known products
export async function generateStaticParams() {
    const products = await getProducts();
    return products.map((product) => ({
        id: product.id,
    }));
}

// Dynamic SEO metadata per product
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return {
            title: 'Product Not Found | Orin Leather',
        };
    }

    const title = `${product.name} | Orin Leather`;
    const description = product.description;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://orinleather.com/products/${product.id}`,
            images: [
                {
                    url: product.image,
                    width: 1200,
                    height: 1200,
                    alt: product.name,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [product.image],
        },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    // Fetch related products (same category)
    const allProducts = await getProducts();
    const relatedProducts = allProducts
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 3);

    // If not enough from same category, fill from others
    if (relatedProducts.length < 3) {
        const extras = allProducts
            .filter((p) => p.id !== product.id && !relatedProducts.find((r) => r.id === p.id))
            .slice(0, 3 - relatedProducts.length);
        relatedProducts.push(...extras);
    }

    return (
        <>
            <ProductDetailClient product={product} relatedProducts={relatedProducts} />
            
            {/* BreadcrumbList Schema for rich search results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Home',
                                item: 'https://orinleather.com',
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Collection',
                                item: 'https://orinleather.com/products',
                            },
                            {
                                '@type': 'ListItem',
                                position: 3,
                                name: product.name,
                                item: `https://orinleather.com/products/${product.id}`,
                            },
                        ],
                    }),
                }}
            />

            {/* Product Schema for rich search results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        image: product.images && product.images.length > 0 ? product.images : [product.image],
                        description: product.description,
                        brand: {
                            '@type': 'Brand',
                            name: 'ORIN',
                        },
                        category: product.category,
                        material: product.materials || 'Full-grain vegetable-tanned leather',
                        color: product.color?.name,
                        offers: {
                            '@type': 'Offer',
                            url: `https://orinleather.com/products/${product.id}`,
                            priceCurrency: 'USD',
                            price: product.price,
                            availability: 'https://schema.org/InStock',
                            seller: {
                                '@type': 'Organization',
                                name: 'ORIN',
                            },
                        },
                    }),
                }}
            />
        </>
    );
}
