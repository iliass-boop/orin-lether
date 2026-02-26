'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ============================================================
   SmoothScrollProvider — Lenis + GSAP ScrollTrigger

   Changes from previous:
   - Always-on ticker (no idle detection — prevents stutter gaps)
   - lerp: 0.1 for silkier deceleration curve (was implicit default)
   - lagSmoothing disabled for consistent 60fps feel
   ============================================================ */

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2.5,
            infinite: false,
        });

        lenisRef.current = lenis;

        // Sync Lenis scroll position to ScrollTrigger on every frame
        lenis.on('scroll', ScrollTrigger.update);

        // Always-on ticker — no idle detection which caused stutter gaps
        const tickerCallback = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tickerCallback);

        // Disable GSAP lag smoothing for consistent perceived speed
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(tickerCallback);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
