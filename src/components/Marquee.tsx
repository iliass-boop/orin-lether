'use client';

import styles from './Marquee.module.css';

const messages = [
    'Free Shipping Over $150',
    '✦',
    'Lifetime Warranty on All Products',
    '✦',
    'Handcrafted in Small Batches',
    '✦',
    'Full-Grain Vegetable-Tanned Leather',
    '✦',
    'Buy Once, Buy Right',
    '✦',
    'Free Shipping Over $150',
    '✦',
    'Lifetime Warranty on All Products',
    '✦',
    'Handcrafted in Small Batches',
    '✦',
    'Full-Grain Vegetable-Tanned Leather',
    '✦',
    'Buy Once, Buy Right',
    '✦',
];

export default function Marquee() {
    return (
        <div className={styles.marquee} aria-label="Promotional banner">
            <div className={styles.track}>
                {messages.map((msg, i) => (
                    <span key={i} className={msg === '✦' ? styles.separator : styles.item}>
                        {msg}
                    </span>
                ))}
            </div>
        </div>
    );
}
