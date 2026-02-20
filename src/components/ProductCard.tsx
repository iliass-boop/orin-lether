'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useCallback } from 'react';
import styles from './ProductCard.module.css';
import { Product, useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/formatPrice';

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
    const addItem = useCartStore((s) => s.addItem);
    const cardRef = useRef<HTMLAnchorElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    // 3D tilt effect
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (y - 0.5) * -10;
        const rotateY = (x - 0.5) * 10;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

        // Move glow to cursor pos
        if (glowRef.current) {
            glowRef.current.style.opacity = '1';
            glowRef.current.style.left = `${x * 100}%`;
            glowRef.current.style.top = `${y * 100}%`;
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        if (glowRef.current) {
            glowRef.current.style.opacity = '0';
        }
    }, []);

    return (
        <Link
            href={`/products/${product.id}`}
            className={styles.card}
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Cursor-following glow */}
            <div className={styles.cardGlow} ref={glowRef} />

            <div className={styles.imageWrapper} ref={imageRef}>
                {/* Badge */}
                {product.bestseller && (
                    <span className={`${styles.badge} ${styles.badgeBestseller}`}>Bestseller</span>
                )}
                {product.isNew && (
                    <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>
                )}

                {/* Product image */}
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={styles.productImage}
                    priority={priority}
                    quality={85}
                />

                {/* Hover overlay */}
                <div className={styles.imageOverlay}>
                    <button className={styles.quickAdd} onClick={handleQuickAdd} aria-label={`Quick add ${product.name}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        <span>Quick Add</span>
                    </button>
                </div>
            </div>

            <div className={styles.info}>
                <p className={styles.subtitle}>{product.subtitle}</p>
                <h3 className={styles.name}>{product.name}</h3>
                <div className={styles.priceLine}>
                    <p className={styles.price}>{formatPrice(product.price)}</p>
                    <div className={styles.swatches}>
                        <span
                            className={styles.swatch}
                            style={{ backgroundColor: product.color.hex }}
                            title={product.color.name}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
