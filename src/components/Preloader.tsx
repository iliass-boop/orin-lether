'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.css';

export default function Preloader() {
    const preloaderRef = useRef<HTMLDivElement>(null);
    const logoCharsRef = useRef<HTMLSpanElement[]>([]);
    const lineRef = useRef<HTMLDivElement>(null);
    const taglineRef = useRef<HTMLParagraphElement>(null);
    const counterRef = useRef<HTMLSpanElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const curtainTopRef = useRef<HTMLDivElement>(null);
    const curtainBottomRef = useRef<HTMLDivElement>(null);
    const [isDone, setIsDone] = useState(() => {
        // Skip preloader on return visits within same session
        if (typeof window !== 'undefined') {
            return !!sessionStorage.getItem('orin-preloaded');
        }
        return false;
    });

    const logoLetters = 'ORIN'.split('');

    useEffect(() => {
        // If already done (return visit), don't run animation at all
        if (isDone) {
            document.body.style.overflow = '';
            return;
        }

        // Prevent scroll during preloader
        document.body.style.overflow = 'hidden';

        const tl = gsap.timeline({
            onComplete: () => {
                setIsDone(true);
                document.body.style.overflow = '';
                // Remember that preloader has been seen
                sessionStorage.setItem('orin-preloaded', '1');
            },
        });

        // Phase 1: Ambient glow fades in
        tl.to(glowRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
        });

        // Phase 2: Counter runs 0 → 100 (tightened from 2s to 1.2s)
        tl.to(
            { val: 0 },
            {
                val: 100,
                duration: 1.2,
                ease: 'power2.inOut',
                onUpdate: function () {
                    const v = Math.round(this.targets()[0].val);
                    if (counterRef.current) counterRef.current.textContent = `${v}`;
                    if (progressRef.current) progressRef.current.style.width = `${v}%`;
                },
            },
            0
        );

        // Phase 3: Logo characters stagger in
        tl.to(
            logoCharsRef.current,
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.08,
                ease: 'power3.out',
            },
            0.3
        );

        // Phase 4: Line draws
        tl.to(
            lineRef.current,
            {
                width: 80,
                duration: 0.5,
                ease: 'power2.inOut',
            },
            0.8
        );

        // Phase 5: Tagline fades in
        tl.to(
            taglineRef.current,
            {
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out',
            },
            1.0
        );

        // Brief hold (reduced from 0.4s to 0.2s)
        tl.to({}, { duration: 0.2 });

        // Phase 6: Everything fades out
        tl.to([...logoCharsRef.current, lineRef.current, taglineRef.current, counterRef.current?.parentElement], {
            opacity: 0,
            y: -20,
            duration: 0.4,
            stagger: 0.02,
            ease: 'power2.in',
        });

        // Phase 7: Curtains split open
        tl.to(curtainTopRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power4.inOut',
        }, '-=0.2');

        tl.to(
            curtainBottomRef.current,
            {
                yPercent: 100,
                duration: 0.8,
                ease: 'power4.inOut',
            },
            '<'
        );

        // Phase 8: Glow fades
        tl.to(
            glowRef.current,
            {
                opacity: 0,
                duration: 0.3,
            },
            '-=0.5'
        );

        return () => {
            tl.kill();
            document.body.style.overflow = '';
        };
    }, [isDone]);

    if (isDone) return null;

    return (
        <div className={`${styles.preloader} ${isDone ? styles.done : ''}`} ref={preloaderRef}>
            {/* Ambient glow */}
            <div className={styles.ambientGlow} ref={glowRef} />

            {/* Logo */}
            <div className={styles.logoContainer}>
                <div className={styles.logoText}>
                    {logoLetters.map((char, i) => (
                        <span
                            key={i}
                            className={styles.logoChar}
                            ref={(el) => {
                                if (el) logoCharsRef.current[i] = el;
                            }}
                        >
                            {char}
                        </span>
                    ))}
                </div>
                <div className={styles.logoLine} ref={lineRef} />
                <p className={styles.tagline} ref={taglineRef}>
                    Leather for the long haul
                </p>
            </div>

            {/* Counter */}
            <div className={styles.counter}>
                <span className={styles.counterNumber} ref={counterRef}>
                    0
                </span>
                <div className={styles.progressTrack}>
                    <div className={styles.progressFill} ref={progressRef} />
                </div>
            </div>

            {/* Curtain panels */}
            <div className={styles.curtainTop} ref={curtainTopRef} />
            <div className={styles.curtainBottom} ref={curtainBottomRef} />
        </div>
    );
}
