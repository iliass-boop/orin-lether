'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        // Detect touch devices
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsTouchDevice(isTouch);
        if (isTouch) return;

        const pos = { x: 0, y: 0 };
        const ring = { x: 0, y: 0 };
        let isMoving = false;
        let idleTimer: ReturnType<typeof setTimeout>;
        let animId: number;

        const onMouseMove = (e: MouseEvent) => {
            pos.x = e.clientX;
            pos.y = e.clientY;
            if (!isVisible) setIsVisible(true);

            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            }

            // Resume ring animation if it was paused
            if (!isMoving) {
                isMoving = true;
                animId = requestAnimationFrame(animateRing);
            }

            // Pause ring animation after 100ms of no mouse movement
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                isMoving = false;
            }, 100);
        };

        const onMouseDown = () => setIsClicking(true);
        const onMouseUp = () => setIsClicking(false);

        const onMouseEnterInteractive = () => setIsHovering(true);
        const onMouseLeaveInteractive = () => setIsHovering(false);

        // Smooth ring follow — only runs when mouse is moving
        const animateRing = () => {
            ring.x += (pos.x - ring.x) * 0.15;
            ring.y += (pos.y - ring.y) * 0.15;
            if (ringRef.current) {
                ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
            }
            if (isMoving) {
                animId = requestAnimationFrame(animateRing);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);

        // Observe interactive elements — debounced
        const interactiveSelectors = 'a, button, [role="button"], input, textarea, select, .interactive';
        let debounceTimer: ReturnType<typeof setTimeout>;

        const attachListeners = () => {
            // Debounce: only re-attach after 500ms of DOM stability
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                document.querySelectorAll(interactiveSelectors).forEach((el) => {
                    el.addEventListener('mouseenter', onMouseEnterInteractive);
                    el.addEventListener('mouseleave', onMouseLeaveInteractive);
                });
            }, 500);
        };

        attachListeners();
        // Re-attach on DOM changes (debounced)
        const observer = new MutationObserver(attachListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            cancelAnimationFrame(animId);
            clearTimeout(idleTimer);
            clearTimeout(debounceTimer);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            observer.disconnect();
            document.querySelectorAll(interactiveSelectors).forEach((el) => {
                el.removeEventListener('mouseenter', onMouseEnterInteractive);
                el.removeEventListener('mouseleave', onMouseLeaveInteractive);
            });
        };
    }, []); // Only initialize once — removed isVisible dependency

    if (isTouchDevice) return null;

    return (
        <>
            <div
                ref={dotRef}
                className={`${styles.dot} ${isVisible ? styles.visible : ''} ${isClicking ? styles.clicking : ''}`}
            />
            <div
                ref={ringRef}
                className={`${styles.ring} ${isVisible ? styles.visible : ''} ${isHovering ? styles.hovering : ''} ${isClicking ? styles.clicking : ''}`}
            />
        </>
    );
}
