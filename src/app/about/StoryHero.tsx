'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './page.module.css';

// Register ScrollTrigger if it's not already registered
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function StoryHero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!heroRef.current || !videoRef.current || !textRef.current) return;

        // Subtle parallax on the video
        gsap.to(videoRef.current, {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });

        // Fade out and translate text down on scroll
        gsap.to(textRef.current, {
            y: 50,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'center top',
                scrub: true,
            },
        });
    }, { scope: heroRef });

    return (
        <section ref={heroRef} className={styles.hero}>
            <div className={styles.heroImageWrapper}>
                <video
                    ref={videoRef}
                    src="/images/brand/story-hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.heroImage}
                />
                <div className={styles.heroOverlay} />
            </div>
            <div ref={textRef} className={styles.heroInner}>
                <p className={styles.heroAccent}>The story behind ORIN</p>
                <h1 className={styles.heroTitle}>
                    We Build Things<br />
                    That Last
                </h1>
                <p className={styles.heroText}>
                    ORIN exists because we were tired of replacing things. Tired of zippers
                    that break, leather that peels, and products designed to be disposable.
                    So we started making our own.
                </p>
            </div>
        </section>
    );
}
