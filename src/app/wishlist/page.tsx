'use client';

import Link from 'next/link';
import styles from './page.module.css';
import { useCartStore, products } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import { useReveal } from '@/hooks/useReveal';

export default function WishlistPage() {
    const wishlist = useCartStore((s) => s.wishlist);
    const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

    const titleRef = useReveal<HTMLHeadingElement>({ preset: 'fadeUp', start: 'top 95%' });
    const gridRef = useReveal<HTMLDivElement>({ preset: 'staggerChildren', stagger: 0.09, start: 'top 90%' });

    if (wishlist.length === 0) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <h1 className={styles.title} ref={titleRef}>Your Wishlist</h1>
                    <div className={styles.emptyState}>
                        <p>Your wishlist is currently empty.</p>
                        <Link href="/products" className={styles.btnSecondary}>
                            Browse Collection
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title} ref={titleRef}>Your Wishlist</h1>
                <p className={styles.count}>{wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}</p>

                <div className={styles.grid} ref={gridRef}>
                    {wishlistProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
