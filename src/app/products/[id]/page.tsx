'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { products, useCartStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import ReviewSection from '@/components/ReviewSection';
import { formatPrice } from '@/lib/formatPrice';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    const addItem = useCartStore((s) => s.addItem);
    const { showToast } = useToast();
    const [activeImage, setActiveImage] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [openAccordion, setOpenAccordion] = useState<string | null>('details');


    const handleAddToCart = () => {
        addItem(product, quantity);
        setAddedToCart(true);
        showToast(`Added ${quantity}× ${product.name} to cart`, 'success');
        setTimeout(() => setAddedToCart(false), 2200);
    };

    const toggleAccordion = (section: string) => {
        setOpenAccordion((prev) => (prev === section ? null : section));
    };

    const imageLabels = ['Front', 'Detail', 'Interior'];

    // Related products — same category, exclude current
    const relatedProducts = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 3);
    // If not enough from same category, fill from others
    if (relatedProducts.length < 3) {
        const extras = products
            .filter((p) => p.id !== product.id && !relatedProducts.find((r) => r.id === p.id))
            .slice(0, 3 - relatedProducts.length);
        relatedProducts.push(...extras);
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <Link href="/">Home</Link>
                    <span className={styles.breadcrumbSep}>/</span>
                    <Link href="/products">Collection</Link>
                    <span className={styles.breadcrumbSep}>/</span>
                    <span>{product.name}</span>
                </nav>

                {/* Product Layout */}
                <div className={styles.productLayout}>
                    {/* Gallery */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImage}>
                            <Image
                                src={product.images[activeImage] || product.image}
                                alt={`${product.name} — ${imageLabels[activeImage] || 'view'}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 55vw"
                                className={styles.mainImagePhoto}
                                priority
                                quality={90}
                            />
                            {/* Color indicator badge on image */}
                            <span className={styles.colorBadge}>
                                <span className={styles.colorDot} style={{ backgroundColor: product.color.hex }} />
                                {product.color.name}
                            </span>
                        </div>

                        {/* Thumbnails for desktop */}
                        {product.images.length > 1 && (
                            <div className={styles.thumbnails}>
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`${styles.thumbnail} ${activeImage === i ? styles.thumbnailActive : ''}`}
                                        onClick={() => setActiveImage(i)}
                                        aria-label={`View ${imageLabels[i] || `image ${i + 1}`}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} ${imageLabels[i] || `view ${i + 1}`}`}
                                            fill
                                            sizes="120px"
                                            className={styles.thumbnailImage}
                                            quality={60}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Dot indicators for mobile */}
                        {product.images.length > 1 && (
                            <div className={styles.dotIndicators}>
                                {product.images.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`${styles.dot} ${activeImage === i ? styles.dotActive : ''}`}
                                        onClick={() => setActiveImage(i)}
                                        aria-label={`View image ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className={styles.details}>
                        {product.bestseller && (
                            <span className={`${styles.badge} ${styles.badgeBestseller}`}>Bestseller</span>
                        )}
                        {product.isNew && (
                            <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>
                        )}

                        <p className={styles.subtitle}>{product.subtitle}</p>
                        <h1 className={styles.name}>{product.name}</h1>
                        <p className={styles.price}>{formatPrice(product.price)}</p>

                        <p className={styles.description}>{product.description}</p>

                        {/* Trust Signals */}
                        <div className={styles.trustStrip}>
                            <div className={styles.trustItem}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span>Lifetime Warranty</span>
                            </div>
                            <div className={styles.trustDivider} />
                            <div className={styles.trustItem}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M21 8l-2-4h-6l-2 4m0 0H3l2 10h14l2-10h-10z" />
                                    <path d="M7.5 8V6a4.5 4.5 0 019 0v2" />
                                </svg>
                                <span>Free Returns</span>
                            </div>
                            <div className={styles.trustDivider} />
                            <div className={styles.trustItem}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>Handcrafted</span>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        {/* Quantity Selector */}
                        <div className={styles.quantitySection}>
                            <span className={styles.quantityLabel}>Quantity</span>
                            <div className={styles.quantityControl}>
                                <button
                                    className={styles.quantityBtn}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span className={styles.quantityValue}>{quantity}</span>
                                <button
                                    className={styles.quantityBtn}
                                    onClick={() => setQuantity(quantity + 1)}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <button
                            className={`${styles.addToCart} ${addedToCart ? styles.addedFeedback : ''}`}
                            onClick={handleAddToCart}
                        >
                            <span className={styles.addToCartInner}>
                                {addedToCart ? (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                            <line x1="3" y1="6" x2="21" y2="6" />
                                            <path d="M16 10a4 4 0 01-8 0" />
                                        </svg>
                                        Add to Cart — {formatPrice(product.price * quantity)}
                                    </>
                                )}
                            </span>
                        </button>

                        <p className={styles.shippingNote}>
                            Complimentary shipping on orders over $200
                        </p>

                        {/* Accordion */}
                        <div className={styles.accordion}>
                            {/* Details */}
                            <div className={`${styles.accordionItem} ${openAccordion === 'details' ? styles.accordionItemOpen : ''}`}>
                                <button
                                    className={styles.accordionHeader}
                                    onClick={() => toggleAccordion('details')}
                                    aria-expanded={openAccordion === 'details'}
                                >
                                    <span>Details &amp; Dimensions</span>
                                    <span className={`${styles.accordionIcon} ${openAccordion === 'details' ? styles.accordionIconOpen : ''}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19" className={styles.accordionPlus} />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </span>
                                </button>
                                <div className={styles.accordionContent}>
                                    <ul className={styles.detailList}>
                                        {product.details.map((detail, i) => (
                                            <li key={i}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Materials */}
                            <div className={`${styles.accordionItem} ${openAccordion === 'materials' ? styles.accordionItemOpen : ''}`}>
                                <button
                                    className={styles.accordionHeader}
                                    onClick={() => toggleAccordion('materials')}
                                    aria-expanded={openAccordion === 'materials'}
                                >
                                    <span>Materials</span>
                                    <span className={`${styles.accordionIcon} ${openAccordion === 'materials' ? styles.accordionIconOpen : ''}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19" className={styles.accordionPlus} />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </span>
                                </button>
                                <div className={styles.accordionContent}>
                                    {product.materials}
                                </div>
                            </div>

                            {/* Care */}
                            <div className={`${styles.accordionItem} ${openAccordion === 'care' ? styles.accordionItemOpen : ''}`}>
                                <button
                                    className={styles.accordionHeader}
                                    onClick={() => toggleAccordion('care')}
                                    aria-expanded={openAccordion === 'care'}
                                >
                                    <span>Care Instructions</span>
                                    <span className={`${styles.accordionIcon} ${openAccordion === 'care' ? styles.accordionIconOpen : ''}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19" className={styles.accordionPlus} />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </span>
                                </button>
                                <div className={styles.accordionContent}>
                                    {product.care}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <div className={styles.divider} />
                <ReviewSection productId={product.id} />

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className={styles.relatedSection}>
                        <h2 className={styles.relatedTitle}>You May Also Like</h2>
                        <div className={styles.relatedGrid}>
                            {relatedProducts.map((rp) => (
                                <Link
                                    key={rp.id}
                                    href={`/products/${rp.id}`}
                                    className={styles.relatedCard}
                                >
                                    <div className={styles.relatedImageWrapper}>
                                        <Image
                                            src={rp.image}
                                            alt={rp.name}
                                            fill
                                            sizes="(max-width: 768px) 80vw, 30vw"
                                            className={styles.relatedImage}
                                            quality={75}
                                        />
                                    </div>
                                    <div className={styles.relatedInfo}>
                                        <p className={styles.relatedSubtitle}>{rp.subtitle}</p>
                                        <h3 className={styles.relatedName}>{rp.name}</h3>
                                        <p className={styles.relatedPrice}>{formatPrice(rp.price)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Mobile Sticky Add to Cart */}
            <div className={styles.stickyBar}>
                <div className={styles.stickyInfo}>
                    <span className={styles.stickyName}>{product.name}</span>
                    <span className={styles.stickyPrice}>{formatPrice(product.price * quantity)}</span>
                </div>
                <button
                    className={`${styles.stickyBtn} ${addedToCart ? styles.addedFeedback : ''}`}
                    onClick={handleAddToCart}
                >
                    {addedToCart ? '✓ Added' : 'Add to Cart'}
                </button>
            </div>

            {/* Schema Markup */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        image: product.image,
                        description: product.description,
                        brand: {
                            '@type': 'Brand',
                            name: 'ORIN',
                        },
                        offers: {
                            '@type': 'Offer',
                            url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://orinleather.com'}/products/${product.id}`,
                            priceCurrency: 'USD',
                            price: product.price,
                            availability: 'https://schema.org/InStock',
                        },
                    }),
                }}
            />
        </div>
    );
}
