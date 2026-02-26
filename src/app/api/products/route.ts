import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/store';

/* ============================================================
   Product Catalog API — ISR-cached at CDN edge
   
   revalidate = 3600 means Next.js caches this route for 1 hour.
   After expiry, the next request triggers a background revalidation
   (stale-while-revalidate) so users never wait for cache misses.
   ============================================================ */

export const revalidate = 3600;
export const dynamic = 'force-static';

export async function GET(_req: NextRequest) {
    // Sanitize output — strip any test/internal fields before sending
    const catalog = products.map(({ id, name, price, description, images, color, bestseller }) => ({
        id,
        name,
        price,
        description,
        images,
        color,
        bestseller,
    }));

    return NextResponse.json(catalog, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            'Vary': 'Accept-Encoding',
        },
    });
}
