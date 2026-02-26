import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type RevealPreset = 'fadeUp' | 'clipReveal' | 'fadeIn' | 'staggerChildren';

interface UseRevealOptions {
    preset?: RevealPreset;
    delay?: number;
    duration?: number;
    stagger?: number;
    /** For staggerChildren — selector for child elements */
    childSelector?: string;
    start?: string;
    once?: boolean;
}

/* ============================================================
   useReveal — Universal GSAP ScrollTrigger Hook

   Usage:
     const ref = useReveal({ preset: 'fadeUp' });
     <div ref={ref as any}>...</div>

   Presets:
   - fadeUp:        Classic luxury fade-up (most used)
   - clipReveal:    Clip-path wipe from bottom — signature luxury move
   - fadeIn:        Pure opacity, no movement (for backgrounds)
   - staggerChildren: Animates direct children sequentially
   ============================================================ */

export function useReveal<T extends HTMLElement = HTMLDivElement>(options: UseRevealOptions = {}) {
    const {
        preset = 'fadeUp',
        delay = 0,
        duration = 0.9,
        stagger = 0.1,
        childSelector = ':scope > *',
        start = 'top 88%',
        once = true,
    } = options;

    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let ctx: gsap.Context;

        ctx = gsap.context(() => {
            const common = {
                scrollTrigger: {
                    trigger: el,
                    start,
                    once,
                    toggleActions: 'play none none none',
                },
                delay,
            };

            switch (preset) {
                case 'fadeUp':
                    gsap.fromTo(
                        el,
                        { y: 50, opacity: 0 },
                        { y: 0, opacity: 1, duration, ...common }
                    );
                    break;

                case 'clipReveal':
                    // Luxury signature: image revealed by rising clip
                    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
                    gsap.to(el, {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        duration: duration * 1.1,
                        ease: 'power4.out',
                        ...common,
                    });
                    break;

                case 'fadeIn':
                    gsap.fromTo(
                        el,
                        { opacity: 0 },
                        { opacity: 1, duration, ...common }
                    );
                    break;

                case 'staggerChildren': {
                    const children = Array.from(el.querySelectorAll(childSelector));
                    if (!children.length) break;
                    gsap.fromTo(
                        children,
                        { y: 40, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration,
                            stagger,
                            ...common,
                        }
                    );
                    break;
                }
            }
        });

        return () => ctx.revert();
    }, [preset, delay, duration, stagger, childSelector, start, once]);

    return ref;
}
