'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import styles from './page.module.css';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: 'I bought The Drifter three years ago. It looks better today than the day it arrived. Every mark tells a story.',
    author: 'James R.',
    role: 'Creative Director',
    rating: 5,
  },
  {
    quote: 'ORIN understands that luxury isn\'t about logos — it\'s about materials that earn their beauty over time.',
    author: 'Sarah K.',
    role: 'Architect',
    rating: 5,
  },
  {
    quote: 'The Ridge wallet has been in my pocket every single day for two years. The patina is incredible.',
    author: 'Michael T.',
    role: 'Photographer',
    rating: 5,
  },
];

const processSteps = [
  {
    num: '01',
    title: 'Source',
    text: 'Full-grain hides from ethical Italian tanneries, vegetable-tanned for 40+ days.',
    stat: '40+',
    unit: 'days of tanning',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  },
  {
    num: '02',
    title: 'Cut',
    text: 'Each piece is hand-cut by pattern. No two are identical — that\'s the point.',
    stat: '1:1',
    unit: 'unique pieces',
    icon: 'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z',
  },
  {
    num: '03',
    title: 'Stitch',
    text: 'Saddle-stitched with waxed linen thread. Stronger than machine stitching.',
    stat: '2×',
    unit: 'stronger than machine',
    icon: 'M19.28 4.93l-2.12-2.12c-.78-.78-2.05-.78-2.83 0L11.5 5.64l2.83 2.83 2.83-2.83c.78-.78.78-2.05 0-2.83l.12.12zM5.49 13.77c-.59.59-.59 1.54 0 2.12l2.83 2.83c.59.59 1.54.59 2.12 0L22 7.16l-2.83-2.83L5.49 13.77zM2 18v4h4l.03-.03-3.97-3.97H2z',
  },
  {
    num: '04',
    title: 'Finish',
    text: 'Edges burnished by hand, sealed with beeswax. Ready for decades.',
    stat: '30+',
    unit: 'year lifespan',
    icon: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  },
];

export default function HomePage() {
  const allProducts = products.slice(0, 6);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const horizontalInnerRef = useRef<HTMLDivElement>(null);

  // Refs for animated elements (avoids fragile global class selectors)
  const heroLinesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const heroFadesRef = useRef<(HTMLElement | null)[]>([]);
  const processStepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const testimonialCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const revealTextsRef = useRef<(HTMLElement | null)[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Small delay to let DOM settle after hydration
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {

        // --- Hero image parallax ---
        if (heroImageRef.current && heroRef.current) {
          gsap.to(heroImageRef.current, {
            yPercent: 20,
            scale: 1.05,
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.2,
            },
          });
        }

        // --- Hero text reveal ---
        const validHeroLines = heroLinesRef.current.filter(Boolean);
        if (validHeroLines.length > 0) {
          const heroTl = gsap.timeline();
          heroTl.fromTo(
            validHeroLines,
            { y: 120, rotateX: -80 },
            {
              y: 0,
              rotateX: 0,
              duration: 1.3,
              stagger: 0.12,
              ease: 'power3.out',
              delay: 2.0,
            }
          );

          const validFades = heroFadesRef.current.filter(Boolean);
          if (validFades.length > 0) {
            heroTl.fromTo(
              validFades,
              { y: 30, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
              },
              '-=0.5'
            );
          }
        }

        // --- Horizontal Scroll Showcase ---
        // Uses native CSS overflow-x scroll (no GSAP pin — avoids Lenis conflicts)

        // --- Process Steps Stagger ---
        processStepsRef.current.filter(Boolean).forEach((step, i) => {
          gsap.fromTo(
            step!,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: step!,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              delay: i * 0.1,
            }
          );
        });

        // --- Testimonial Cards ---
        testimonialCardsRef.current.filter(Boolean).forEach((card) => {
          gsap.fromTo(
            card!,
            { y: 50, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card!,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        // --- Reveal Texts ---
        revealTextsRef.current.filter(Boolean).forEach((el) => {
          gsap.fromTo(
            el!,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el!,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        // Refresh after everything is set up
        ScrollTrigger.refresh();

      }, containerRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [mounted]);

  // Helper to push refs into arrays
  const addHeroLine = (el: HTMLSpanElement | null, i: number) => {
    heroLinesRef.current[i] = el;
  };
  const addHeroFade = (el: HTMLElement | null, i: number) => {
    heroFadesRef.current[i] = el;
  };
  const addRevealText = (el: HTMLElement | null) => {
    if (el && !revealTextsRef.current.includes(el)) {
      revealTextsRef.current.push(el);
    }
  };

  return (
    <div ref={containerRef}>
      {/* ===== Cinematic Hero ===== */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroImageWrapper} ref={heroImageRef}>
          <Image
            src="/images/brand/hero-banner.png"
            alt="ORIN leather goods collection — handcrafted bags and accessories"
            fill
            priority
            quality={90}
            className={styles.heroImage}
            sizes="100vw"
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeLine} />
            <span className={styles.heroBadgeText} ref={(el) => addHeroFade(el, 0)}>Est. 2024 — Handcrafted</span>
            <span className={styles.heroBadgeLine} />
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>
              <span ref={(el) => addHeroLine(el, 0)}>Leather That</span>
            </span>
            <span className={styles.heroTitleLine}>
              <span ref={(el) => addHeroLine(el, 1)}>Outlives</span>
            </span>
            <span className={styles.heroTitleLineAccent}>
              <span ref={(el) => addHeroLine(el, 2)}>Trends</span>
            </span>
          </h1>

          <p className={styles.heroTagline} ref={(el) => addHeroFade(el, 1)}>
            Full-grain, vegetable-tanned leather goods designed to develop
            character with every carry, every scratch, every journey.
          </p>

          <div className={styles.heroCta} ref={(el) => addHeroFade(el, 2)}>
            <Link href="/products" className={styles.heroBtnPrimary}>
              <span>Shop the Collection</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/about" className={styles.heroBtnSecondary}>
              Our Story
            </Link>
          </div>
        </div>

        <div className={styles.heroScrollHint}>
          <div className={styles.scrollLine} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ===== Marquee Divider ===== */}
      <section className={styles.marqueeDivider}>
        <div className={styles.marqueeTrack}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.marqueeContent}>
              <span>Handcrafted</span>
              <span className={styles.marqueeDot}>◆</span>
              <span>Full-Grain Leather</span>
              <span className={styles.marqueeDot}>◆</span>
              <span>Vegetable-Tanned</span>
              <span className={styles.marqueeDot}>◆</span>
              <span>Built for Decades</span>
              <span className={styles.marqueeDot}>◆</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Philosophy Split ===== */}
      <section className={styles.philosophy}>
        <div className={styles.philosophyInner}>
          <div className={styles.philosophyContent}>
            <p className={styles.sectionLabel} ref={addRevealText}>Our Philosophy</p>
            <h2 className={styles.philosophyTitle} ref={addRevealText}>
              Worn, Not<br />Worn Out.
            </h2>
            <p className={styles.philosophyText} ref={addRevealText}>
              We don&apos;t chase seasons. We chase decades. Every ORIN piece is cut, stitched,
              and finished by hand from full-grain vegetable-tanned leather — the kind that
              arrives stiff and golden, then softens and deepens into something entirely yours.
            </p>
            <p className={styles.philosophyText} ref={addRevealText}>
              The scratch on your bag isn&apos;t damage — it&apos;s a chapter. The darkening of your
              wallet isn&apos;t wear — it&apos;s patina. We build things that get better the more you
              use them.
            </p>
            <Link href="/about" className={styles.philosophyLink} ref={addRevealText}>
              <span>Read Our Story</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className={styles.philosophyImageWrapper}>
            <Image
              src="/images/brand/craftsmanship.png"
              alt="Artisan hand-stitching ORIN leather goods"
              fill
              quality={85}
              className={styles.philosophyImage}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ===== Horizontal Scroll Showcase ===== */}
      <section className={styles.horizontalSection} ref={horizontalRef}>
        <div className={styles.horizontalInner} ref={horizontalInnerRef}>
          {/* Intro Panel */}
          <div className={styles.horizontalIntro}>
            <p className={styles.sectionLabel}>The Collection</p>
            <h2 className={styles.horizontalTitle}>
              Built to Be<br />Carried
            </h2>
            <p className={styles.horizontalSubtitle}>
              Scroll to explore our handcrafted essentials →
            </p>
          </div>

          {/* Product Cards */}
          {allProducts.map((product, i) => (
            <div key={product.id} className={styles.horizontalCard}>
              <ProductCard product={product} priority={i < 2} />
            </div>
          ))}

          {/* End Panel */}
          <div className={styles.horizontalEnd}>
            <Link href="/products" className={styles.horizontalEndLink}>
              <span>View All</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Process Section ===== */}
      <section className={styles.process}>
        <div className={styles.processInner}>
          {/* Left: Atmospheric Image */}
          <div className={styles.processImageCol}>
            <div className={styles.processImageWrapper}>
              <Image
                src="/images/brand/craftsmanship.png"
                alt="Artisan hand-crafting ORIN leather goods"
                fill
                quality={85}
                className={styles.processImage}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className={styles.processImageOverlay} />
            </div>
            <div className={styles.processImageFloater} ref={addRevealText}>
              <span className={styles.floaterStat}>100%</span>
              <span className={styles.floaterLabel}>Handcrafted</span>
            </div>
          </div>

          {/* Right: Steps */}
          <div className={styles.processStepsCol}>
            <div className={styles.processHeader}>
              <p className={styles.sectionLabel} ref={addRevealText}>The Process</p>
              <h2 className={styles.processTitle} ref={addRevealText}>
                Four Steps.<br />Zero Shortcuts.
              </h2>
              <p className={styles.processSubtitle} ref={addRevealText}>
                Every ORIN piece passes through four deliberate stages — each one essential, none rushed.
              </p>
            </div>

            <div className={styles.processStepsList}>
              {processSteps.map((step, i) => (
                <div
                  key={step.num}
                  className={styles.processStep}
                  ref={(el) => { processStepsRef.current[i] = el; }}
                >
                  <div className={styles.processStepIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d={step.icon} />
                    </svg>
                  </div>
                  <div className={styles.processStepBody}>
                    <div className={styles.processStepTop}>
                      <span className={styles.processNum}>{step.num}</span>
                      <div className={styles.processProgressTrack}>
                        <div
                          className={styles.processProgressBar}
                          style={{ '--progress-width': `${(i + 1) * 25}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>
                    <h3 className={styles.processStepTitle}>{step.title}</h3>
                    <p className={styles.processStepText}>{step.text}</p>
                    <div className={styles.processStepStat}>
                      <span className={styles.statValue}>{step.stat}</span>
                      <span className={styles.statUnit}>{step.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className={styles.testimonials}>
        <div className={styles.testimonialsInner}>
          <p className={styles.sectionLabel} ref={addRevealText}>What They Say</p>
          <h2 className={styles.testimonialsTitle} ref={addRevealText}>Words From the Road</h2>

          <div className={styles.testimonialGrid}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={styles.testimonialCard}
                ref={(el) => { testimonialCardsRef.current[i] = el; }}
              >
                <div className={styles.testimonialStars}>
                  {'★'.repeat(t.rating)}
                </div>
                <blockquote className={styles.testimonialQuote}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className={styles.testimonialAuthor}>
                  <span className={styles.testimonialName}>{t.author}</span>
                  <span className={styles.testimonialRole}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Newsletter ===== */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <div className={styles.newsletterContent}>
            <p className={styles.newsletterAccent}>Join the journey</p>
            <h2 className={styles.newsletterTitle}>Stories, Drops &amp; Leather Notes</h2>
            <p className={styles.newsletterText}>
              First access to new pieces, behind-the-scenes craft stories,
              and the occasional leather care tip. No noise.
            </p>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.newsletterInputWrapper}>
                <input
                  type="email"
                  placeholder="Your email"
                  className={styles.newsletterInput}
                  required
                />
                <button type="submit" className={styles.newsletterBtn}>
                  Subscribe
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <p className={styles.ctaAccent} ref={addRevealText}>Your next favorite thing</p>
          <h2 className={styles.ctaTitle} ref={addRevealText}>
            Start With One Piece.
          </h2>
          <p className={styles.ctaText} ref={addRevealText}>
            We think you&apos;ll understand.
          </p>
          <Link href="/products" className={styles.ctaBtnPrimary} ref={addRevealText}>
            Explore the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
