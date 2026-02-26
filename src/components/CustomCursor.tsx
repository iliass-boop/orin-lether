'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CustomCursor.module.css';

/* ============================================================
   CustomCursor — Context-Aware Luxury Cursor

   States:
   - default:  dot + trailing ring
   - hovering: ring expands
   - view:     on product images → shows "VIEW" label
   - cta:      on primary buttons/cart → cognac fill
   - clicking: dot scales down (click feedback)
   - touch:    not rendered
   ============================================================ */

type CursorMode = 'default' | 'hovering' | 'view' | 'drag' | 'cta';

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<CursorMode>('default');
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsTouchDevice(isTouch);
        if (isTouch) return;

        const pos = { x: 0, y: 0 };
        const ring = { x: 0, y: 0 };
        let animId: number;

        const onMove = (e: MouseEvent) => {
            pos.x = e.clientX;
            pos.y = e.clientY;
            setIsVisible(true);
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            }
        };

        const animateRing = () => {
            ring.x += (pos.x - ring.x) * 0.12;
            ring.y += (pos.y - ring.y) * 0.12;
            if (ringRef.current) {
                ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
            }
            animId = requestAnimationFrame(animateRing);
        };
        animId = requestAnimationFrame(animateRing);

        const onDown = () => setIsClicking(true);
        const onUp = () => setIsClicking(false);

        document.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mousedown', onDown);
        document.addEventListener('mouseup', onUp);

        // Context-aware mode detection
        const updateMode = (e: MouseEvent) => {
            const target = e.target as Element;

            // Product images / image containers → VIEW
            if (target.closest('[data-cursor="view"]') || target.closest('.productImageWrapper')) {
                setMode('view');
                return;
            }
            // Drag / 3D viewer zones
            if (target.closest('[data-cursor="drag"]')) {
                setMode('drag');
                return;
            }
            // CTAs: add-to-cart, checkout, primary buttons
            if (target.closest('[data-cursor="cta"]') || target.closest('button[class*="cartButton"]') || target.closest('button[class*="addToCart"]') || target.closest('a[class*="btn"]')) {
                setMode('cta');
                return;
            }
            // General interactive hover
            if (target.closest('a, button, [role="button"], input, select, textarea')) {
                setMode('hovering');
                return;
            }
            setMode('default');
        };

        document.addEventListener('mousemove', updateMode, { passive: true });

        return () => {
            cancelAnimationFrame(animId);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mousemove', updateMode);
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('mouseup', onUp);
        };
    }, []);

    if (!mounted || isTouchDevice) return null;

    const label = mode === 'view' ? 'VIEW' : mode === 'drag' ? 'DRAG' : null;

    return (
        <>
            {/* Center dot — instant tracking */}
            <div
                ref={dotRef}
                className={`${styles.dot} ${isVisible ? styles.visible : ''} ${isClicking ? styles.clicking : ''} ${styles[`mode_${mode}`] || ''}`}
            />

            {/* Trailing ring — lerped */}
            <div
                ref={ringRef}
                className={`${styles.ring} ${isVisible ? styles.visible : ''} ${isClicking ? styles.clicking : ''} ${styles[`mode_${mode}`] || ''}`}
            >
                {label && <span className={styles.label}>{label}</span>}
            </div>
        </>
    );
}
