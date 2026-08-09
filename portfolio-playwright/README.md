# Portfolio Playwright Suite

This is the public, standalone black-box test suite for [piotrdolinski.com](https://piotrdolinski.com). It contains no application source and can run against production or another deployment supplied through `BASE_URL`.

## Setup

Node.js 20 or newer is required.

```bash
npm ci
npx playwright install
```

Install a single engine when you only need one project, for example:

```bash
npx playwright install chromium
```

## Run

Production is the default target:

```bash
npm test
```

Use the same configured reporters with a single worker:

```bash
npm run test:ci
```

Run against another deployment or a separately started local application:

```bash
BASE_URL=http://127.0.0.1:3000 npm test
```

Select one locale or browser project:

```bash
TEST_LOCALE=pl npm test
npm test -- --project=chromium
```

Useful static checks:

```bash
npm run typecheck
npm run test:list
```

`TEST_LOCALE` accepts `en`, `pl`, `de`, `es`, or `ar`. Unsupported values fail with a clear configuration error.

## Coverage

The suite covers:

- critical smoke, navigation, contact, CV, and project journeys;
- English, Polish, German, Spanish, and Arabic routing and content contracts;
- desktop and mobile responsive behavior, layout geometry, and touch targets;
- semantic and keyboard accessibility contracts plus axe-core scans;
- canonical, OpenGraph, and locale-specific SEO metadata;
- the portfolio's intentional bug-hunt interactions;
- public Code/Demo links and private-project affordances.

Playwright runs the same tests through five configured projects:

- `chromium` — Desktop Chrome;
- `firefox` — Desktop Firefox;
- `webkit` — Desktop Safari;
- `Mobile Chrome` — Pixel 5 profile;
- `Mobile Safari` — iPhone 12 profile.

## Reports and CI

Failures retain screenshots, video, and traces under the ignored `test-results/` directory. The HTML report is written to `playwright-report/`, and JUnit output to `test-results/junit.xml`.

The public [GitHub Actions workflow](https://github.com/Vicoold/cv_project/actions/workflows/portfolio-playwright.yml) runs each project independently with zero retries and publishes failure artifacts for 14 days. It runs for relevant pushes and pull requests, can be started manually, and has a weekly production check.

## Scope and limitations

This package mirrors the verified black-box suite used for the portfolio. Updates are copied only after the source suite passes its local verification gates.

Browser automation cannot prove every aspect of usability or accessibility. axe-core detects a subset of accessibility problems; manual review and testing with assistive technologies remain necessary. Production runs also depend on the deployed site and its external resources being available.
