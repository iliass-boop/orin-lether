'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import styles from '@/app/products/page.module.css';
import ProductCard from '@/components/ProductCard';
import { type Product, categories } from '@/lib/store';
import { useDebounce } from '@/hooks/useDebounce';
import { useReveal } from '@/hooks/useReveal';

function ProductsFilterContent({ initialProducts }: { initialProducts: Product[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const headerRef = useReveal<HTMLDivElement>({ preset: 'staggerChildren', stagger: 0.12, start: 'top 95%' });
    const controlRef = useReveal<HTMLDivElement>({ preset: 'fadeUp', delay: 0.1, start: 'top 95%' });
    const gridRef = useReveal<HTMLDivElement>({ preset: 'staggerChildren', stagger: 0.08, start: 'top 90%' });

    // The URL is the Single Source of Truth for the active category
    const activeCategory = searchParams.get('category') || 'all';

    // Local state strictly for instant input-binding (so the keyboard doesn't lag)
    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const debouncedSearchQuery = useDebounce(inputValue, 400);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value && value !== 'all') {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    // Sync debounced search to URL
    useEffect(() => {
        const newUrl = pathname + '?' + createQueryString('q', debouncedSearchQuery);
        // Only replace if the URL actually changed to prevent loops
        if (searchParams.get('q') !== debouncedSearchQuery && (searchParams.has('q') || debouncedSearchQuery !== '')) {
            router.replace(newUrl, { scroll: false });
        }
    }, [debouncedSearchQuery, pathname, createQueryString, searchParams, router]);

    // Derived State: Calculate immediately based on URL parameters
    const filteredProducts = initialProducts.filter((p) => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const currentSearch = searchParams.get('q') || '';
        const matchesSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            p.description.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleCategoryChange = (slug: string) => {
        router.push(pathname + '?' + createQueryString('category', slug), { scroll: false });
    };

    const handleSearchChange = (value: string) => {
        setInputValue(value);
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerImageWrapper}>
                    <video
                        src="/videos/Premium_Product_Collection_Animation.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className={styles.headerImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className={styles.headerOverlay} />
                </div>
                <div className={styles.headerInner} ref={headerRef}>
                    <p className={styles.accent}>The Essentials Collection</p>
                    <h1 className={styles.title}>Our Collection</h1>
                    <p className={styles.description}>
                        Eight pieces. Each one designed to last for decades, not seasons.
                        Full-grain leather that ages with you.
                    </p>
                </div>
            </header>

            {/* Controls */}
            <div className={styles.controls} ref={controlRef}>
                {/* Search */}
                <div className={styles.searchWrapper}>
                    <input
                        id="collection-search"
                        type="search"
                        placeholder="Search collection..."
                        value={inputValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className={styles.searchInput}
                        aria-label="Search collection"
                    />
                    <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            className={`${styles.filterBtn} ${activeCategory === cat.slug ? styles.filterBtnActive : ''}`}
                            onClick={() => handleCategoryChange(cat.slug)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <section className={styles.gridSection}>
                <div className={styles.gridInner}>
                    <p className={styles.resultCount}>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                    </p>
                    <div className={styles.grid} ref={gridRef}>
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function ProductsFilter({ initialProducts }: { initialProducts: Product[] }) {
    return (
        <Suspense fallback={<div className={styles.page}>Loading collection...</div>}>
            <ProductsFilterContent initialProducts={initialProducts} />
        </Suspense>
    );
}
