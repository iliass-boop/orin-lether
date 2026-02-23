'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './PageTransition.module.css';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevPathRef = useRef(pathname);

    useEffect(() => {
        if (pathname !== prevPathRef.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsTransitioning(true);
            // Reduced from 400ms to 150ms — fast enough for CSS fade, no perceptible freeze
            const timeout = setTimeout(() => {
                setDisplayChildren(children);
                setIsTransitioning(false);
                prevPathRef.current = pathname;
                window.scrollTo(0, 0);
            }, 150);
            return () => clearTimeout(timeout);
        } else {
            setDisplayChildren(children);
        }
    }, [pathname, children]);

    return (
        <div
            className={`${styles.transition} ${isTransitioning ? styles.exiting : styles.entering}`}
            style={{ willChange: isTransitioning ? 'opacity' : 'auto' }}
        >
            {displayChildren}
        </div>
    );
}
