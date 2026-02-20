'use client';

import { useState } from 'react';
import styles from './page.module.css';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/lib/store';

export default function ProductsPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter((p) => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <p className={styles.accent}>The Essentials Collection</p>
                    <h1 className={styles.title}>Our Collection</h1>
                    <p className={styles.description}>
                        Eight pieces. Each one designed to last for decades, not seasons.
                        Full-grain leather that ages with you.
                    </p>
                </div>
            </header>

            {/* Controls */}
            <div className={styles.controls}>
                {/* Search */}
                <div className={styles.searchWrapper}>
                    <label htmlFor="collection-search" className="sr-only">Search collection</label>
                    <input
                        id="collection-search"
                        type="search"
                        placeholder="Search collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            onClick={() => setActiveCategory(cat.slug)}
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
                    <div className={styles.grid}>
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
