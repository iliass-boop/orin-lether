import http from 'k6/http';
import { check, sleep } from 'k6';

/* ============================================================
   Orin Leather — Enterprise Load Test Configuration
   Run with: k6 run scripts/load.js
   ============================================================ */

export const options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp up to 50 concurrent users
        { duration: '1m', target: 100 }, // Sustain 100 concurrent users representing a traffic spike
        { duration: '30s', target: 0 },  // Ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
        http_req_failed: ['rate<0.01'],   // Error rate must be < 1%
    },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
    // 1. Visit Homepage
    const resHome = http.get(`${BASE_URL}/`);
    check(resHome, {
        'homepage returns 200': (r) => r.status === 200,
    });
    sleep(1);

    // 2. View Products API (Cached Edge Route)
    const resApiProducts = http.get(`${BASE_URL}/api/products`);
    check(resApiProducts, {
        'products API returns 200': (r) => r.status === 200,
        'products API is fast': (r) => r.timings.duration < 200, // Edge cache should be extremely fast
    });
    sleep(2);

    // 3. View Collection Page (ISR)
    const resProducts = http.get(`${BASE_URL}/products`);
    check(resProducts, {
        'collection page returns 200': (r) => r.status === 200,
    });
    sleep(1);

    // 4. View Product Detail Page (SSG)
    const resDrifter = http.get(`${BASE_URL}/products/the-drifter`);
    check(resDrifter, {
        'drifter page returns 200': (r) => r.status === 200,
    });
    sleep(2);
}
