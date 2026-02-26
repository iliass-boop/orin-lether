import * as http from 'k6/http';
import { sleep, check } from 'k6';

/* ============================================================
   Spike Test — load-tests/spike.js
   
   Purpose: Simulate a flash sale / viral post thundering herd.
   Jumps from 0 → 1000 VUs in 10 seconds, then backs off.
   The app must survive and return errors gracefully (not crash).
   
   Run: k6 run load-tests/spike.js
   ============================================================ */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
    stages: [
        { duration: '10s', target: 1000 }, // Instant spike
        { duration: '1m', target: 1000 }, // Hold at spike
        { duration: '30s', target: 0 },    // Rapid cooldown
    ],
    thresholds: {
        // During a spike we accept higher latency — but the server must not crash
        http_req_failed: ['rate<0.10'],   // < 10% error rate (rate limiting expected)
        http_req_duration: ['p(95)<2000'],  // p95 < 2s under spike
    },
};

export default function () {
    // During spikes, hit the homepage and product API equally
    const paths = ['/', '/api/products', '/products'];
    const path = paths[Math.floor(Math.random() * paths.length)];

    const res = http.get(`${BASE_URL}${path}`);

    check(res, {
        // 200 or 429 (rate limited) are both acceptable — server crash (5xx) is not
        'not a 5xx': (r) => r.status < 500,
    });

    sleep(0.5);
}
