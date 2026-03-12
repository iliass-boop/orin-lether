import { createClient } from '../supabase/server';
import { products as hardcodedProducts, type Product } from '../store';
import { Database } from '../supabase/types';

// Map database row to our application Product type
function mapProductRowToProduct(row: Database['public']['Tables']['products']['Row']): Product {
    return {
        id: row.id,
        name: row.name,
        subtitle: row.subtitle,
        price: row.price,
        category: row.category as 'bags' | 'wallets' | 'accessories',
        description: row.description,
        details: row.details || [],
        materials: row.materials,
        care: row.care,
        image: row.image,
        images: row.images || [row.image],
        color: {
            name: row.color_name,
            hex: row.color_hex,
            slug: row.color_slug,
        },
        bestseller: row.bestseller,
        isNew: row.is_new,
        video: row.video_url || undefined,
        model3dUrl: row.model_3d_url || undefined,
        model3dImages: row.model_3d_images || undefined,
    };
}

/**
 * Fetch all products, with a static fallback to the hardcoded store data
 * in case Supabase is not configured or throws an error.
 */
export async function getProducts(): Promise<Product[]> {
    const supabase = await createClient();

    if (!supabase) {
        // Fallback to static data if Supabase isn't configured
        return hardcodedProducts;
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[PRODUCTS_FETCH_ERROR]', error.message);
            return hardcodedProducts;
        }

        if (!data || data.length === 0) {
            return hardcodedProducts;
        }

        return data.map(mapProductRowToProduct);
    } catch (err) {
        console.error('[PRODUCTS_UNEXPECTED_ERROR]', err);
        return hardcodedProducts;
    }
}

/**
 * Fetch a single product by ID, with static fallback.
 */
export async function getProductById(id: string): Promise<Product | null> {
    const supabase = await createClient();

    if (!supabase) {
        return hardcodedProducts.find((p) => p.id === id) || null;
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`[PRODUCT_FETCH_ERROR] ID: ${id}`, error.message);
            return hardcodedProducts.find((p) => p.id === id) || null;
        }

        if (!data) return null;

        return mapProductRowToProduct(data);
    } catch (err) {
        console.error(`[PRODUCT_UNEXPECTED_ERROR] ID: ${id}`, err);
        return hardcodedProducts.find((p) => p.id === id) || null;
    }
}
