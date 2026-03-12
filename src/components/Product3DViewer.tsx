'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Product3DViewerProps {
    images?: string[]; // Array of 12 images for 360 spinner
}

export default function Product3DViewer({ images }: Product3DViewerProps) {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Preload frames 1, 2, and 11 for immediate nearby interactions
    useEffect(() => {
        if (!images || images.length === 0) return;

        const preloadIndexes = [1, 2, images.length - 1];
        preloadIndexes.forEach(index => {
            if (images[index]) {
                const img = new window.Image();
                img.src = images[index];
            }
        });

        // Lazy load the rest after a short delay
        const timeoutId = setTimeout(() => {
            for (let i = 3; i < images.length - 1; i++) {
                if (images[i]) {
                    const img = new window.Image();
                    img.src = images[i];
                }
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [images]);

    const handleInteractionStart = useCallback((clientX: number) => {
        setIsDragging(true);
        setStartX(clientX);
    }, []);

    const handleInteractionMove = useCallback((clientX: number) => {
        if (!isDragging || !containerRef.current || !images || images.length === 0) return;

        const containerWidth = containerRef.current.clientWidth;
        const deltaX = clientX - startX;

        // 1 full drag across container width = 1 full rotation (12 frames)
        const frameShift = Math.round((deltaX / containerWidth) * images.length);

        if (frameShift !== 0) {
            let nextFrame = (currentFrame - frameShift) % images.length;
            if (nextFrame < 0) nextFrame += images.length;

            setCurrentFrame(nextFrame);
            // Reset startX to current position so the next delta is relative
            setStartX(clientX);
        }
    }, [isDragging, startX, currentFrame, images]);

    const handleInteractionEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Mouse Events
    const handleMouseDown = (e: React.MouseEvent) => handleInteractionStart(e.clientX);
    const handleMouseMove = (e: React.MouseEvent) => handleInteractionMove(e.clientX);

    // Touch Events
    const handleTouchStart = (e: React.TouchEvent) => handleInteractionStart(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => {
        // Prevent default scrolling only when horizontally interacting with the spinner
        if (isDragging) {
            e.preventDefault();
        }
        handleInteractionMove(e.touches[0].clientX);
    };

    // Global event listeners to handle drag release outside the container
    useEffect(() => {
        const onMouseUpOrLeave = () => handleInteractionEnd();

        if (isDragging) {
            window.addEventListener('mouseup', onMouseUpOrLeave);
            window.addEventListener('touchend', onMouseUpOrLeave);
            window.addEventListener('mousecancel', onMouseUpOrLeave);
            window.addEventListener('touchcancel', onMouseUpOrLeave);
        }

        return () => {
            window.removeEventListener('mouseup', onMouseUpOrLeave);
            window.removeEventListener('touchend', onMouseUpOrLeave);
            window.removeEventListener('mousecancel', onMouseUpOrLeave);
            window.removeEventListener('touchcancel', onMouseUpOrLeave);
        };
    }, [isDragging, handleInteractionEnd]);

    if (!images || images.length === 0) {
        return (
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#111111',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
            }}>
                360° View Pending
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            // Add a style block or switch to a proper CSS module if preferred
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                background: '#111', // Layer 1: Static Background container
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'pan-y' // Allow vertical scroll, handle horizontal in JS
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            {/* Layer 2: Static soft ground shadow layer */}
            <div style={{
                position: 'absolute',
                left: '50%',
                top: '75%', // Position directly beneath the bag
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '8%',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '50%',
                filter: 'blur(20px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* Layer 3: Rotating product image layer */}
            {/* Preloading all images invisibly to ensure zero flicker when switching */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
                {images.map((imgSrc, index) => (
                    <Image
                        key={imgSrc}
                        src={imgSrc}
                        alt={`Product View ${index + 1}`}
                        fill
                        priority={index === 0} // Only block FCP for the first image
                        sizes="(max-width: 768px) 100vw, 55vw"
                        style={{
                            objectFit: 'contain',
                            // Instant frame switching, no fade/opacity blending
                            display: currentFrame === index ? 'block' : 'none',
                        }}
                        draggable={false} // Prevent browser image drag
                    />
                ))}
            </div>

            {/* Layer 4: Interaction controller overlay (Indicator) */}
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none', // Handled by container
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.5)',
                padding: '0.4rem 1rem',
                borderRadius: '100px',
                backdropFilter: 'blur(10px)',
                zIndex: 10,
                opacity: isDragging ? 0 : 1, // Fade out while dragging for cleaner look
                transition: 'opacity 0.3s ease'
            }}>
                Drag to explore 360°
            </div>
        </div>
    );
}
