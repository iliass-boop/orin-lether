'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrand}>
                        <div className={styles.footerLogo}>
                            ORI<span className={styles.footerLogoAccent}>N</span>
                        </div>
                        <p className={styles.footerTagline}>
                            Leather goods for the long haul.<br />
                            Worn, not worn out.
                        </p>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4>Shop</h4>
                        <ul>
                            <li><Link href="/products">All Products</Link></li>
                            <li><Link href="/products?category=bags">Bags</Link></li>
                            <li><Link href="/products?category=wallets">Wallets</Link></li>
                            <li><Link href="/products?category=accessories">Accessories</Link></li>
                        </ul>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4>Brand</h4>
                        <ul>
                            <li><Link href="/about">Our Story</Link></li>
                            <li><Link href="/about#craftsmanship">Craftsmanship</Link></li>
                            <li><Link href="/about#materials">Materials</Link></li>
                            <li><Link href="/about#sustainability">Sustainability</Link></li>
                        </ul>
                    </div>

                    <div className={styles.newsletter}>
                        <h4>Stay in the loop</h4>
                        <p>New releases, craft stories, and early access — no spam, ever.</p>
                        <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                className={styles.newsletterInput}
                                aria-label="Email address"
                            />
                            <button type="submit" className={styles.newsletterButton}>
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <span>© 2026 ORIN. All rights reserved.</span>
                    <span>Handcrafted with intention.</span>
                </div>
            </div>
        </footer>
    );
}
