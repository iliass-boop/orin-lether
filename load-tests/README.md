# Load Testing — Orin Leather

## Prerequisites

Install [k6](https://k6.io/docs/getting-started/installation/):
```bash
# Windows (via Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo apt-get install k6
```

## Running Tests

All tests accept a `BASE_URL` environment variable (defaults to `http://localhost:3000`).

| Script | Command | Purpose | Duration |
|--------|---------|---------|----------|
| Smoke  | `npm run test:load:smoke` | Quick sanity — did anything break? | ~1 min |
| Load   | `npm run test:load` | Real traffic simulation | ~6 min |
| Spike  | `k6 run load-tests/spike.js` | Flash-sale / thundering herd | ~2 min |
| Soak   | `k6 run load-tests/soak.js` | Memory leak detection | ~4 hours |
| Checkout | `k6 run load-tests/scenarios/checkout.js` | Checkout API specifically | ~5 min |

### Run against staging
```bash
k6 run -e BASE_URL=https://staging.orinleather.com load-tests/load.js
```

## SLO Thresholds

| Metric | Threshold | Test that enforces it |
|--------|-----------|----------------------|
| Error rate | < 1% | smoke, load, checkout |
| p95 response time | < 500ms | smoke, load, checkout |
| p99 response time | < 1000ms | load |
| Spike error rate | < 10% | spike (rate limiting expected) |
| Soak p95 | < 800ms | soak (check for drift) |
| Checkout API p95 | < 500ms | checkout scenario |

## Interpreting Results

- **`http_req_failed` rate** — > 1% means errors beyond rate-limiting; investigate logs
- **`http_req_duration` p95 growing over soak** — memory leak or connection pool exhaustion
- **429 status codes during spike** — expected and correct (Upstash Redis limiting works)
- **503 / 500 during spike** — server crashed; investigate rate limiter fallback

## CI Integration (GitHub Actions)

```yml
- name: Smoke test
  run: k6 run --out json=results.json load-tests/smoke.js
  env:
    BASE_URL: ${{ secrets.STAGING_URL }}
```
