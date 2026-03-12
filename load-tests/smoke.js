import * as http from 'k6/http';
import { sleep, check } from 'k6';

/* ============================================================
   Smoke Test — load-tests/smoke.js
   
   Purpose: Sanity check that the app starts and responds.
   5 virtual users for 1 minute. Expect 0 errors.
   
   Run: k6 run load-tests/smoke.js
        k6 run -e BASE_URL=https://staging.orinleather.com load-tests/smoke.js
   ============================================================ */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
    vus: 5,
    duration: '1m',
    thresholds: {
        http_req_failed: ['rate<0.01'],           // < 1% error rate
        http_req_duration: ['p(95)<500'],         // 95th pct < 500ms
    },
};

export default function () {
    // Homepage
    const homeRes = http.get(`${BASE_URL}/`);
    check(homeRes, {
        'homepage 200': (r) => r.status === 200,
        'homepage < 500ms': (r) => r.timings.duration < 500,
    });

    // Product listing
    const productsRes = http.get(`${BASE_URL}/products`);
    check(productsRes, {
        'products 200': (r) => r.status === 200,
    });

    // Products API (ISR-cached)
    const apiRes = http.get(`${BASE_URL}/api/products`);
    check(apiRes, {
        'api/products 200': (r) => r.status === 200,
        'api/products returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    });

    sleep(1);
}
