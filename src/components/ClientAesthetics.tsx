'use client';

import { useEffect, useState } from 'react';

/*  Lazy-load aesthetic overlays only on the client.
    Re-written with plain React.lazy to break a persistent
    Turbopack HMR cache that referenced a deleted dynamic import. */

function LazyFilmGrain() {
    const [Comp, setComp] = useState<React.ComponentType | null>(null);
    useEffect(() => {
        import('@/components/FilmGrain').then((m) => setComp(() => m.default));
    }, []);
    return Comp ? <Comp /> : null;
}

function LazyPreloader() {
    const [Comp, setComp] = useState<React.ComponentType | null>(null);
    useEffect(() => {
        import('@/components/Preloader').then((m) => setComp(() => m.default));
    }, []);
    return Comp ? <Comp /> : null;
}

export default function ClientAesthetics() {
    return (
        <>
            <LazyPreloader />
            <LazyFilmGrain />
        </>
    );
}
