'use client';

import Link from 'next/link';

import styles from './page.module.css';
import { useCartStore, products } from '@/lib/store';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
    const { wishlist } = useCartStore();
    const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

    if (wishlist.length === 0) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Your Wishlist</h1>
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
                <h1 className={styles.title}>Your Wishlist</h1>
                <p className={styles.count}>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>

                <div className={styles.grid}>
                    {wishlistProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
