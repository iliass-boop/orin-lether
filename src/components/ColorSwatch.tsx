'use client';

import styles from './ColorSwatch.module.css';
import { LeatherColor } from '@/lib/store';

interface ColorSwatchProps {
    colors: LeatherColor[];
    selected: LeatherColor;
    onChange: (color: LeatherColor) => void;
    showLabel?: boolean;
}

export default function ColorSwatch({ colors, selected, onChange, showLabel = true }: ColorSwatchProps) {
    return (
        <div className={styles.swatchGroup}>
            {showLabel && (
                <p className={styles.label}>
                    Color <span className={styles.colorName}>{selected.name}</span>
                </p>
            )}
            <div className={styles.swatches}>
                {colors.map((color) => (
                    <button
                        key={color.slug}
                        className={`${styles.swatch} ${selected.slug === color.slug ? styles.swatchActive : ''}`}
                        onClick={() => onChange(color)}
                        aria-label={`Select ${color.name}`}
                        aria-pressed={selected.slug === color.slug}
                        title={color.name}
                    >
                        <div
                            className={styles.swatchInner}
                            style={{ backgroundColor: color.hex }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
