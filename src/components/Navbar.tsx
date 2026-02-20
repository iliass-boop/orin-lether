'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import styles from './Navbar.module.css';
import gsap from 'gsap';

const navLinks = [
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'Our Story' },
    { href: '/products?category=bags', label: 'Bags' },
    { href: '/products?category=wallets', label: 'Wallets' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const toggleCart = useCartStore((s) => s.toggleCart);
    const totalItems = useCartStore((s) => s.totalItems);
    const navRef = useRef<HTMLElement>(null);
    const linkRefs = useRef<HTMLAnchorElement[]>([]);
    const lastScrollY = useRef(0);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Scroll behavior: transparent → glass on scroll, hide on scroll down
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 60);
            setHidden(y > lastScrollY.current && y > 300);
            lastScrollY.current = y;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Magnetic hover effect on links
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>, idx: number) => {
        const el = linkRefs.current[idx];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.4,
            ease: 'power2.out',
        });
    }, []);

    const handleMouseLeave = useCallback((idx: number) => {
        const el = linkRefs.current[idx];
        if (!el) return;
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
        });
    }, []);

    // Mobile menu body lock (only when CartDrawer is not also open)
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            // Only restore if CartDrawer isn't also preventing scroll
            const cartOpen = document.body.dataset.cartOpen === 'true';
            if (!cartOpen) document.body.style.overflow = '';
        }
        return () => {
            const cartOpen = document.body.dataset.cartOpen === 'true';
            if (!cartOpen) document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    return (
        <>
            <nav
                className={`${styles.nav} ${scrolled ? styles.scrolled : ''} ${hidden ? styles.hidden : ''}`}
                ref={navRef}
            >
                <div className={styles.navInner}>
                    <Link href="/" className={styles.logo}>
                        ORI<span className={styles.logoAccent}>N</span>
                    </Link>

                    <div className={styles.navLinks}>
                        {navLinks.map((link, i) => {
                            const isActive = pathname === link.href ||
                                (link.href !== '/' && pathname.startsWith(link.href.split('?')[0]));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                                    ref={(el) => { if (el) linkRefs.current[i] = el; }}
                                    onMouseMove={(e) => handleMouseMove(e, i)}
                                    onMouseLeave={() => handleMouseLeave(i)}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <span className={styles.navLinkText}>{link.label}</span>
                                    <span className={styles.navLinkUnderline} />
                                </Link>
                            );
                        })}
                    </div>

                    <div className={styles.navRight}>
                        <button className={styles.cartButton} onClick={toggleCart} aria-label="Open cart">
                            <div className={styles.cartIcon}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 01-8 0" />
                                </svg>
                                {totalItems() > 0 && (
                                    <span className={styles.cartBadge}>{totalItems()}</span>
                                )}
                            </div>
                        </button>

                        <button
                            className={`${styles.menuToggle} ${mobileOpen ? styles.menuOpen : ''}`}
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Full-screen mobile overlay */}
            <div className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOverlayOpen : ''}`}>
                <div className={styles.mobileOverlayContent}>
                    {navLinks.map((link, i) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={styles.mobileLink}
                            onClick={() => setMobileOpen(false)}
                            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                        >
                            <span className={styles.mobileLinkNumber}>0{i + 1}</span>
                            <span className={styles.mobileLinkText}>{link.label}</span>
                        </Link>
                    ))}
                </div>

                <div className={styles.mobileOverlayFooter}>
                    <p>Leather for the long haul</p>
                </div>
            </div>
        </>
    );
}
