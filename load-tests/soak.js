import * as http from 'k6/http';
import { sleep, check } from 'k6';

/* ============================================================
   Soak Test — load-tests/soak.js
   
   Purpose: Detect memory leaks, connection pool exhaustion, and
   performance drift over time (4 hours at sustained 50 VUs).
   
   Run: k6 run load-tests/soak.js
   NOTE: This runs for 4 hours. Use --out cloud for long-lived results.
   ============================================================ */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
    stages: [
        { duration: '5m', target: 50 },   // Ramp up
        { duration: '4h', target: 50 },   // Soak
        { duration: '5m', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        // Drift check: p95 must not grow > 800ms even after 4 hours
        http_req_duration: ['p(95)<800'],
    },
};

export default function () {
    // Mix browsing and API traffic
    const routes = [
        { path: '/', weight: 4 },
        { path: '/products', weight: 3 },
        { path: '/api/products', weight: 2 },
        { path: '/about', weight: 1 },
    ];

    for (const route of routes) {
        for (let i = 0; i < route.weight; i++) {
            const res = http.get(`${BASE_URL}${route.path}`);
            check(res, { [`${route.path} ok`]: (r) => r.status === 200 });
        }
    }

    sleep(2);
}
