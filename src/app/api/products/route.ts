import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/data/products';

/* ============================================================
   Product Catalog API — ISR-cached at CDN edge
   ============================================================ */

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

        let products = await getProducts();

        // Optional filtering
        if (category) {
            products = products.filter((p) => p.category === category);
        }

        // Optional limit
        if (limit && !isNaN(limit) && limit > 0) {
            products = products.slice(0, limit);
        }

        // Sanitize output 
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
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                'Vary': 'Accept-Encoding',
            },
        });
    } catch (error: unknown) {
        console.error('[PRODUCTS_API_ERROR]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

