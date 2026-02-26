import * as http from 'k6/http';
import { sleep, check, group } from 'k6';

/* ============================================================
   Checkout Scenario — load-tests/scenarios/checkout.js
   
   Purpose: Test the checkout API specifically under load.
   Simulates a realistic cart-to-checkout flow.
   
   Run: k6 run load-tests/scenarios/checkout.js
   
   NOTE: Uses test product IDs — these match src/lib/store.ts
   ============================================================ */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Real product IDs from the catalog
const PRODUCT_IDS = [
    'the-drifter',
    'the-folio',
    'the-minimalist',
    'the-weekender',
];

export const options = {
    stages: [
        { duration: '1m', target: 10 },  // Ramp up
        { duration: '3m', target: 10 },  // Sustain
        { duration: '30s', target: 0 },   // Wind down
    ],
    thresholds: {
        // Checkout must be fast — it's in the critical payment path
        'group_duration{group:::Checkout API}': ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    group('Browse Products', () => {
        const res = http.get(`${BASE_URL}/api/products`);
        check(res, { 'products loaded': (r) => r.status === 200 });
        sleep(1);
    });

    group('Checkout API', () => {
        // Simulate a 1-2 item cart with random products
        const items = [
            {
                productId: PRODUCT_IDS[Math.floor(Math.random() * PRODUCT_IDS.length)],
                quantity: Math.floor(Math.random() * 2) + 1,
            },
        ];

        const res = http.post(
            `${BASE_URL}/api/checkout`,
            JSON.stringify({ items }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    // Include a fake CSRF token — checkout is CSRF-exempt per middleware
                },
            }
        );

        check(res, {
            'checkout 200': (r) => r.status === 200,
            'has clientSecret': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    return typeof body.clientSecret === 'string';
                } catch {
                    return false;
                }
            },
            'checkout < 500ms': (r) => r.timings.duration < 500,
        });

        sleep(2);
    });
}
