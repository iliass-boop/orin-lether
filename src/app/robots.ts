import { MetadataRoute } from 'next';

/* ============================================================
   Programmatic robots.txt — SEO Skill
   
   - Allows all crawlers to index all public pages
   - Blocks crawler access to API routes and admin paths
   - References the sitemap for discovery
   ============================================================ */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orinleather.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/checkout/', '/_next/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
