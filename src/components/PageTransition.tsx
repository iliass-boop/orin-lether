'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import styles from './PageTransition.module.css';

/* ============================================================
   GSAP Cinema Curtain — Page Transition (v2)
   
   Fix over v1: GSAP owns the curtain position entirely.
   - gsap.set on mount → starts hidden below viewport
   - tl.to (not fromTo) → no position snapping
   - tlRef.kill() → no stacking if user navigates fast
   - onComplete reset → ready for next navigation
   ============================================================ */

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const curtainRef = useRef<HTMLDivElement>(null);
    const prevPathRef = useRef(pathname);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    // Initialize curtain below viewport on first mount — GSAP takes full ownership
    useEffect(() => {
        if (curtainRef.current) {
            gsap.set(curtainRef.current, { yPercent: 100 });
        }
    }, []);

    useEffect(() => {
        if (pathname === prevPathRef.current) return;
        prevPathRef.current = pathname;

        const curtain = curtainRef.current;
        if (!curtain) return;

        // Kill any in-progress transition before starting new one
        if (tlRef.current) tlRef.current.kill();

        const tl = gsap.timeline({
            onComplete: () => {
                // Reset below viewport so it's ready for next navigation
                gsap.set(curtain, { yPercent: 100 });
            },
        });
        tlRef.current = tl;

        // 1. Curtain sweeps up from below
        tl.to(curtain, { yPercent: 0, duration: 0.45, ease: 'power3.inOut' });

        // 2. Brief hold + scroll reset
        tl.add(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        });

        // 3. Curtain exits upward
        tl.to(curtain, { yPercent: -100, duration: 0.5, ease: 'power3.inOut' }, '+=0.08');
    }, [pathname]);

    return (
        <>
            {/* Curtain — GSAP owns this element entirely. suppressHydrationWarning
                silences the mismatch from GSAP injecting willChange inline styles client-side */}
            <div ref={curtainRef} className={styles.curtain} aria-hidden="true" suppressHydrationWarning />

            {/* Page content — no opacity animation to avoid React timing issues */}
            <div className={styles.content}>{children}</div>
        </>
    );
}
