'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Register inside effect to ensure client-only execution
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,
            infinite: false,
        });

        lenisRef.current = lenis;
        lenis.on('scroll', ScrollTrigger.update);

        // Idle-aware ticker: only run lenis.raf when actively scrolling
        let isScrolling = false;
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const tickerCallback = (time: number) => {
            lenis.raf(time * 1000);
        };

        const onScrollStart = () => {
            if (!isScrolling) {
                isScrolling = true;
                gsap.ticker.add(tickerCallback);
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                gsap.ticker.remove(tickerCallback);
            }, 150); // Stop ticking 150ms after last scroll event
        };

        // Start ticker initially to handle any pending animations
        gsap.ticker.add(tickerCallback);

        // Listen for scroll events to manage the ticker
        lenis.on('scroll', onScrollStart);

        // After initial render, set up idle detection
        const initTimeout = setTimeout(() => {
            if (!isScrolling) {
                gsap.ticker.remove(tickerCallback);
            }
        }, 1000);

        // Use GSAP default lag smoothing for better performance on slower devices
        // (removed: gsap.ticker.lagSmoothing(0))

        return () => {
            clearTimeout(scrollTimeout);
            clearTimeout(initTimeout);
            gsap.ticker.remove(tickerCallback);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
