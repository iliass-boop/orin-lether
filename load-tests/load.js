import * as http from 'k6/http';
import { sleep, check } from 'k6';

/* ============================================================
   Load Test — load-tests/load.js
   
   Purpose: Simulate real production traffic.
   Ramps from 0 → 100 VUs over 2 min, holds for 3 min, ramps down.
   SLO: p95 < 500ms, p99 < 1000ms, error rate < 1%.
   
   Run: k6 run load-tests/load.js
   ============================================================ */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
    stages: [
        { duration: '2m', target: 100 },  // Ramp up
        { duration: '3m', target: 100 },  // Hold at peak
        { duration: '1m', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],         // < 1% error rate
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
    },
};

// Simulated user journeys (weighted by real traffic patterns)
const JOURNEYS = [
    { weight: 50, path: '/' },             // Browse homepage
    { weight: 30, path: '/products' },     // Browse products
    { weight: 10, path: '/about' },        // About page
    { weight: 10, path: '/api/products' }, // SPA product fetch
];

function pickJourney() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const j of JOURNEYS) {
        cumulative += j.weight;
        if (rand < cumulative) return j;
    }
    return JOURNEYS[0];
}

export default function () {
    const journey = pickJourney();
    const res = http.get(`${BASE_URL}${journey.path}`);

    check(res, {
        [`${journey.path} succeeds`]: (r) => r.status < 400,
        [`${journey.path} < 1s`]: (r) => r.timings.duration < 1000,
    });

    sleep(Math.random() * 3 + 1); // 1–4s think time
}
