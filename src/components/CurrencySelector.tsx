'use client';

import { useState, useRef, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import styles from './CurrencySelector.module.css';

const CURRENCY_LIST = Object.values(CURRENCIES) as (typeof CURRENCIES[CurrencyCode])[];

export default function CurrencySelector() {
    const currency = useCartStore((s) => s.currency);
    const setCurrency = useCartStore((s) => s.setCurrency);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Guard against SSR/localStorage hydration mismatch.
    // Zustand persist rehydrates from localStorage after SSR; currency
    // is undefined during that window, causing 'useStore is not defined'.
    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, []);

    // Don't render until store is hydrated on the client
    if (!mounted) return null;

    const current = CURRENCIES[currency ?? 'USD'];

    return (
        <div className={styles.wrapper} ref={ref}>
            <button
                className={styles.trigger}
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label={`Currency: ${current.name}`}
            >
                <span className={styles.flag}>{current.flag}</span>
                <span className={styles.code}>{current.code}</span>
                <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                    width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <ul className={styles.dropdown} role="listbox" aria-label="Select currency">
                    {CURRENCY_LIST.map((c) => (
                        <li key={c.code} role="option" aria-selected={c.code === currency}
                            className={`${styles.option} ${c.code === currency ? styles.optionActive : ''}`}
                            onClick={() => { setCurrency(c.code as CurrencyCode); setOpen(false); }}>
                            <span className={styles.flag}>{c.flag}</span>
                            <span className={styles.optionCode}>{c.code}</span>
                            <span className={styles.optionName}>{c.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
