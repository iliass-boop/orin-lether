import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/data/products';

/* ============================================================
   Dynamic Sitemap — SEO Skill
   
   Generates a complete sitemap for search engine crawlers.
   - Static pages: /, /about, /products, /checkout
   - Dynamic pages: /products/[id] for each product
   
   Revalidated via ISR when product data changes.
   ============================================================ */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orinleather.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const products = await getProducts();
        productPages = products.map((product) => ({
            url: `${SITE_URL}/products/${product.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('[SITEMAP] Failed to fetch products:', error);
    }

    return [...staticPages, ...productPages];
}
