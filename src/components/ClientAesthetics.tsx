'use client';

import dynamic from 'next/dynamic';

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });
const FilmGrain = dynamic(() => import('@/components/FilmGrain'), { ssr: false });
const Preloader = dynamic(() => import('@/components/Preloader'), { ssr: false });

export default function ClientAesthetics() {
    return (
        <>
            <Preloader />
            <CustomCursor />
            <FilmGrain />
        </>
    );
}
