import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import StoryHero from './StoryHero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About',
    description: 'The story behind ORIN — handcrafted leather goods designed for decades, not seasons. Learn about our craft, materials, and philosophy.',
};

const values = [
    {
        title: 'Craft Over Hype',
        text: 'We don\'t do marketing campaigns. We do hand-stitched seams, burnished edges, and solid brass hardware. The product is the story.',
    },
    {
        title: 'Built to Last',
        text: 'Every ORIN piece is designed for at least 20 years of daily use. We warranty against defects for life, because we mean it.',
    },
    {
        title: 'Honest Materials',
        text: 'Full-grain, vegetable-tanned leather. Solid brass. Waxed cotton. We list every material because we\'re proud of every one.',
    },
    {
        title: 'Intentional Design',
        text: 'We don\'t add pockets for the sake of pockets. Every line, compartment, and closure exists because it earned its place.',
    },
    {
        title: 'Sustainable by Nature',
        text: 'The most sustainable product is the one you never throw away. We build things that outlast trends.',
    },
    {
        title: 'Fair & Transparent',
        text: 'We price honestly. No artificial markups, no "sale" theater. What you see is what it costs to make something that lasts.',
    },
];

const materialDetails = [
    {
        label: 'Full-Grain Leather',
        desc: 'The outermost layer of the hide — strongest, most durable, develops the richest patina over time.',
    },
    {
        label: 'Vegetable Tanning',
        desc: 'An ancient process using tree bark extracts instead of chemicals. Slower, more expensive, infinitely better.',
    },
    {
        label: 'Solid Brass Hardware',
        desc: 'No zinc alloy, no plating. Solid brass that develops a warm antique patina alongside your leather.',
    },
    {
        label: 'Waxed Cotton Lining',
        desc: 'Water-resistant, breathable, and naturally durable. An honest complement to honest leather.',
    },
];

export default function AboutPage() {
    return (
        <div className={styles.page}>
            <StoryHero />

            {/* Story */}
            <section className={styles.story}>
                <div className={styles.storyInner}>
                    <div className={styles.storyContent}>
                        <p className={styles.sectionLabel}>Our Origin</p>
                        <h2 className={styles.storyTitle}>
                            Born from Frustration.<br />
                            Built with Intention.
                        </h2>
                        <p className={styles.storyText}>
                            ORIN started with a bag that fell apart. A premium bag, from a premium
                            brand, that lasted exactly 14 months. The zipper went first. Then the
                            strap. Then the &quot;genuine leather&quot; started peeling like sunburned skin.
                        </p>
                        <p className={styles.storyText}>
                            We thought: what if we just... built it properly? Full-grain leather
                            instead of bonded. Solid brass instead of zinc alloy. Hand-stitched
                            seams instead of glued. What if we built the bag that should have
                            existed all along?
                        </p>
                        <p className={styles.storyText}>
                            That first bag became The Drifter. Five years later, it&apos;s still going.
                            The leather is darker, the corners are soft, and every scratch tells
                            a story. That&apos;s what ORIN is about.
                        </p>
                    </div>
                    <div className={styles.storyImage}>
                        <Image
                            src="/images/brand/about-workshop.png"
                            alt="Artisan hand-burnishing saddle leather"
                            fill
                            quality={90}
                            className={styles.sectionImage}
                        />
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className={styles.values}>
                <div className={styles.valuesInner}>
                    <div className={styles.valuesHeader}>
                        <p className={styles.sectionLabel}>What We Believe</p>
                        <h2 className={styles.valuesTitle}>Six Principles. Zero Shortcuts.</h2>
                    </div>
                    <div className={styles.valuesGrid}>
                        {values.map((value, i) => (
                            <div key={value.title} className={styles.valueCard}>
                                <div className={styles.valueNumber}>0{i + 1}</div>
                                <h3 className={styles.valueTitle}>{value.title}</h3>
                                <p className={styles.valueText}>{value.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Materials */}
            <section className={styles.materials}>
                <div className={styles.materialsInner}>
                    <div className={styles.materialsImage}>
                        <Image
                            src="/images/brand/about-materials.png"
                            alt="Raw leather materials and brass hardware"
                            fill
                            quality={90}
                            className={styles.sectionImage}
                        />
                    </div>
                    <div className={styles.materialsContent}>
                        <p className={styles.sectionLabel}>Materials</p>
                        <h2 className={styles.materialsTitle}>
                            We Only Use<br />
                            Things We&apos;re Proud Of
                        </h2>
                        <p className={styles.materialsText}>
                            Every material in an ORIN product is chosen for one reason: it gets
                            better with time. Not cheaper. Not faster. Better.
                        </p>
                        <div className={styles.materialsList}>
                            {materialDetails.map((mat) => (
                                <div key={mat.label} className={styles.materialItem}>
                                    <div className={styles.materialDot} />
                                    <div>
                                        <p className={styles.materialLabel}>{mat.label}</p>
                                        <p className={styles.materialDesc}>{mat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Promise */}
            <section className={styles.promise}>
                <div className={styles.promiseInner}>
                    <p className={styles.promiseAccent}>Our promise</p>
                    <h2 className={styles.promiseTitle}>
                        Worn, Not Worn Out.
                    </h2>
                    <p className={styles.promiseText}>
                        Every ORIN product comes with a lifetime warranty against manufacturing
                        defects. Not because we have to. Because we know it&apos;ll never be used.
                    </p>
                    <Link href="/products" className="btn btn-primary" style={{ backgroundColor: 'var(--cognac)' }}>
                        Shop the Collection
                    </Link>
                </div>
            </section>
        </div>
    );
}
