# Portfolio Test Audit and Public Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the portfolio application and its Playwright suite at source, publish a verified standalone black-box copy in the public CV repository, expose public Code and Demo links, and regenerate the factual two-page CV.

**Architecture:** `/Users/pdolinski/web/portfolio` remains the application and test source of truth. The public repository receives a dependency-minimal mirror that targets the deployed portfolio through `BASE_URL` and has its own CI workflow. Portfolio UI data explicitly distinguishes public code from private repositories, while the CV links only to the public mirror and describes verified engineering practices.

**Tech Stack:** Next.js 16, React 18, TypeScript, Playwright, axe-core, GitHub Actions, HTML/CSS, WeasyPrint, Poppler, Git.

## Global Constraints

- Design source: `/Users/pdolinski/cv_project/docs/superpowers/specs/2026-08-09-portfolio-test-audit-public-demo-design.md`.
- Portfolio source: `/Users/pdolinski/web/portfolio`; repository root: `/Users/pdolinski/web`.
- Public repository and CV: `/Users/pdolinski/cv_project`.
- Public test-code URL: `https://github.com/Vicoold/cv_project/tree/master/portfolio-playwright`.
- Public run-history URL: `https://github.com/Vicoold/cv_project/actions/workflows/portfolio-playwright.yml`.
- Production target: `https://piotrdolinski.com`.
- Fix application defects in application code and test defects in test code; do not hide failures with retries, swallowed exceptions, arbitrary global timeout increases, or conditional early exits.
- Do not expose the private `web` repository, copy application source into the CV repository, or modify BUG: The Gathering.
- Do not add volatile exact test counts, execution times, invented productivity metrics, complete-WCAG claims, or private repository links to the CV or public README.
- Work directly on the already-approved `master` branches, preserve unrelated changes, and push only after the relevant verification gates pass.

---

## File Map

### Portfolio source repository

- Modify: `portfolio/tests/localization.spec.ts` — deterministic desktop and mobile locale switching.
- Modify: `portfolio/tests/pages/BasePage.ts` — navigation without redundant load-state waits.
- Modify: `portfolio/tests/bug-hunt.spec.ts` — stable terminal assertion and language-switch synchronization.
- Modify as audit evidence requires: `portfolio/tests/*.spec.ts`, `portfolio/tests/pages/*.ts` — remove false-green branches and replace sleeps with observable state.
- Modify: `portfolio/playwright.config.ts` — honest CI behavior and generated-report handling.
- Modify: `portfolio/tests/README.md` — accurate source-suite documentation.
- Modify: `portfolio/components/testing-strategy.tsx` — valid images and public Code/CI links.
- Modify: `portfolio/components/terminal-widget.tsx` — count-independent simulated terminal copy and a testable Bug 6 interaction.
- Modify: `portfolio/app/[locale]/cv/page.tsx` — explicit successful/error PDF loading state.
- Modify: `portfolio/lib/seo.ts` — production canonical origin.
- Modify: `portfolio/lib/projects-data.ts` — explicit `hasPublicCode` data and public URLs.
- Modify: `portfolio/components/projects.tsx` — public Code action on the test-suite card while retaining private buttons elsewhere.
- Modify: `portfolio/app/[locale]/projects/[slug]/page.tsx` — public Code and Demo actions on the test-suite detail page.
- Modify as required: `portfolio/messages/{en,pl,de,es,ar}.json` — only claims or labels changed by the audit.
- Modify: portfolio Playwright specs that exercise project actions, Testing-page actions, images, and private-code behavior.
- Modify: `portfolio/.gitignore` and `/Users/pdolinski/web/.github/workflows/playwright.yml` — generated-result hygiene and one build per CI run.

### Public CV repository

- Create: `portfolio-playwright/.gitignore` — ignores Playwright-generated artifacts.
- Create: `portfolio-playwright/package.json` and `package-lock.json` — reproducible standalone dependencies and commands.
- Create: `portfolio-playwright/playwright.config.ts` — remote-only five-project configuration.
- Create: `portfolio-playwright/tsconfig.json` — focused test TypeScript settings.
- Create: `portfolio-playwright/README.md` — accurate public usage and coverage description.
- Create: `portfolio-playwright/tests/**` — verified mirror of source specs, page objects, and locale helper, excluding the private source README.
- Create: `.github/workflows/portfolio-playwright.yml` — public production smoke/regression workflow with artifacts.
- Modify: `Piotr_Dolinski_SDET_CV_EN.html` — title alignment, concrete AI work, CSS spacing, public link, and verified BUG TDD description.
- Replace: `output/pdf/Piotr_Dolinski_CV.pdf` — regenerated two-page selectable-text artifact.

### Task 1: Establish Failing Regression Checks for Known Source Defects

**Files:**
- Test: `portfolio/tests/localization.spec.ts`
- Test: `portfolio/tests/navigation.spec.ts`
- Test: `portfolio/tests/bug-hunt.spec.ts`

**Interfaces:**
- Consumes: existing `data-testid="language-switcher"`, `data-testid="language-option-pl"`, and localized routes.
- Produces: reproducible failures that distinguish the ambiguous locale locator, the mobile false-green path, the redundant load wait, and the stale terminal text.

- [ ] **Step 1: Confirm a clean source baseline**

Run from `/Users/pdolinski/web/portfolio`:

```bash
git status --short
git diff --check
```

Expected: no source changes. If a tracked `test-results.json` was changed by a previous run, restore only that generated file before continuing.

- [ ] **Step 2: Reproduce the deterministic locale failure**

Run:

```bash
node_modules/.bin/playwright test tests/localization.spec.ts --project=chromium --workers=1 --retries=0 --reporter=line
```

Expected before the fix: `should switch language via UI language selector` fails because `text=PL` resolves to unrelated English copy and the URL remains `/en`.

- [ ] **Step 3: Reproduce the full-path timing failure under the source configuration**

Run:

```bash
node_modules/.bin/playwright test tests/navigation.spec.ts --project=chromium --workers=5 --retries=0 --reporter=line
```

Record whether the full user path reaches the 30-second budget. The known trace must still be retained as evidence even if a single rerun happens to pass.

- [ ] **Step 4: Capture the stale terminal assertion before changing it**

Run:

```bash
rg -n "Running 65 tests|waitForTimeout\(5000\)" tests/bug-hunt.spec.ts components/terminal-widget.tsx
```

Expected: the test hard-codes `65` and sleeps five seconds before asserting UI that has its own observable content.

### Task 2: Repair Navigation and Localization Synchronization

**Files:**
- Modify: `portfolio/tests/pages/BasePage.ts`
- Modify: `portfolio/tests/localization.spec.ts`
- Modify: `portfolio/tests/bug-hunt.spec.ts`

**Interfaces:**
- Consumes: `localePath(path: string): string`, the navbar's localized `Open main menu` label, and language option test IDs.
- Produces: `BasePage.goto(path?: string): Promise<void>` that performs one navigation, plus locale tests that always execute on desktop and mobile.

- [ ] **Step 1: Remove the redundant global load helper**

Change `BasePage.goto()` to:

```ts
async goto(path: string = '/') {
  await this.page.goto(localePath(path));
}
```

Delete `waitForPageLoad()`. Keep readiness checks in the page object or test that knows which UI state is required.

- [ ] **Step 2: Make the locale-switch test exercise both layouts**

Use this synchronization pattern in `localization.spec.ts`:

```ts
test('should switch language via UI language selector', async ({ page, isMobile }) => {
  await page.goto('/en');

  if (isMobile) {
    await page.getByRole('button', { name: /open main menu/i }).click();
  }

  await page.getByTestId('language-switcher').click();
  await page.getByTestId('language-option-pl').click();
  await expect(page).toHaveURL(/\/pl(?:\/|$)/);
  await expect(page.getByText(/Dostępny do nowych wyzwań/i)).toBeVisible();
});
```

Remove `text=PL`, `networkidle`, the one-second sleep, the swallowed `waitForURL` error, and the visibility guard.

- [ ] **Step 3: Synchronize repeated bug-hunt language switches on URLs**

After each option click, assert the expected locale segment with `await expect(page).toHaveURL(...)`. Keep `test.slow()` only if the delayed three-switch Easter egg legitimately exceeds the normal budget on the five-browser matrix; do not use `networkidle` as the completion signal.

- [ ] **Step 4: Verify the focused fixes**

Run:

```bash
node_modules/.bin/playwright test tests/localization.spec.ts tests/navigation.spec.ts tests/bug-hunt.spec.ts --project=chromium --workers=1 --retries=0 --reporter=line
```

Expected: all focused Chromium cases pass without swallowed failures.

### Task 3: Audit and Stabilize the Remaining Source Suite

**Files:**
- Modify as justified: `portfolio/tests/accessibility.spec.ts`
- Modify as justified: `portfolio/tests/features.spec.ts`
- Modify as justified: `portfolio/tests/responsive.spec.ts`
- Modify as justified: `portfolio/tests/seo.spec.ts`
- Modify as justified: `portfolio/tests/smoke.spec.ts`
- Modify as justified: `portfolio/tests/pages/*.ts`
- Modify: `portfolio/tests/bug-hunt.spec.ts`
- Modify: `portfolio/playwright.config.ts`
- Modify: `portfolio/tests/README.md`

**Interfaces:**
- Consumes: stable roles, labels, test IDs, URLs, document metadata, computed layout, and axe scan results exposed by the application.
- Produces: assertions that fail when a user-visible contract breaks and do not silently skip their intent.

- [ ] **Step 1: Build an audit matrix from every spec and helper**

For each test declaration, record its user-visible contract, selector, synchronization signal, and whether every branch reaches at least one assertion. Use these scans to seed the review:

```bash
rg -n "waitForTimeout|networkidle|\.catch\(\(\) => \{\}\)|if \(await .*isVisible|if \(await .*count|\.first\(\)|locator\('text=|test\.slow|toBeTruthy\(\)" tests playwright.config.ts
rg -n "65 tests|100%|WCAG compliant|no flaky|execution time|github.com/Vicoold/web" tests/README.md tests
```

- [ ] **Step 2: Replace conditional passes with required contracts**

For example, the theme test must require the theme button and assert class changes with `expect.poll` rather than execute only when `count() > 0`:

```ts
await expect(themeButton).toBeVisible();
await themeButton.click();
await expect.poll(async () => htmlElement.evaluate((el) => el.classList.contains('dark')))
  .toBe(!initialIsDark);
```

Apply the same rule to mobile menu paths and bounding-box checks: if the test claims an element exists, first assert it is visible and then assert its geometry.

Correct the accessibility checks so they use accessible names, require a meaningful `alt` or an explicitly decorative empty `alt`, prove that focus moves to an interactive element, inspect `outlineStyle` and `outlineWidth`, and require exactly one `h1` where the test says exactly one. Remove tautologies such as `alt.length >= 0`.

- [ ] **Step 3: Replace arbitrary waits with observable state**

Remove each sleep or `networkidle` wait when an equivalent URL, locator state, CSS class, bounding box, animation completion, or content assertion exists. Retain a delay only where the product contract itself is time-based; document that reason next to the delay.

- [ ] **Step 4: Make the terminal check semantic and count-independent**

Replace the hard-coded `Running 65 tests` product copy with count-independent simulated-run text. Make the Bug 6 test perform the terminal interaction and assert the resulting overlay/message/counter; do not rename an interaction test into a passive rendering test merely to make it pass. The test must not contain a literal suite size or a five-second hydration sleep.

- [ ] **Step 5: Add failing regressions for the CV loader and canonical origin**

The CV test must fail unless the iframe has a successful loaded state and its document contains `Piotr Doliński`. The SEO test must assert canonical and Open Graph URLs begin with `https://piotrdolinski.com/`, not merely end in a locale path. Confirm the current implementation fails because it accepts a wrapper-only iframe and `lib/seo.ts` still uses `https://yourportfolio.com`.

- [ ] **Step 6: Repair the owning application code**

In the CV page, check `response.ok`, expose explicit `data-loaded` and error UI state, and set success only after the iframe content is ready. In `lib/seo.ts`, set the canonical origin to `https://piotrdolinski.com`. Keep the regression assertions user-visible and do not reach into implementation state that a broken page could set prematurely.

- [ ] **Step 7: Remove duplicated device contexts and shallow responsive passes**

Use the configured Playwright projects as the device/browser matrix instead of creating iPhone, iPad, and Pixel contexts inside every project. Require bounding boxes before overlap assertions, inspect all intended visible touch targets against the documented 44×44 target, and make viewport tests assert layout properties rather than only section existence.

- [ ] **Step 8: Tighten smoke and navigation contracts**

Do not ignore every console error containing `404`; allowlist only known third-party noise and fail on missing same-origin assets. Make CTA tests navigate to their expected destination or assert their exact href. Make contact journeys assert `/about#contact` and the visible contact section. Name syntax-only external-link checks honestly unless network availability is explicitly tested.

- [ ] **Step 9: Make CI surface first-attempt failures**

Set `retries: 0` and `failOnFlakyTests: true` in CI. Keep failure traces, screenshots, and video. Stop tracking `test-results.json`; configure JUnit output under an ignored `test-results/` directory. If `BASE_URL` is supplied, omit `webServer`; otherwise let local runs build and start the app, while CI uses its existing build step and starts it only once.

- [ ] **Step 10: Rewrite the source README from verified behavior**

Document setup, local/remote commands, five configured projects, the real spec categories, environment variables, artifacts, and limitations. Describe axe-core scans as automated accessibility checks rather than complete WCAG conformance.

- [ ] **Step 11: Run type and discovery checks**

Run:

```bash
npx tsc --noEmit
node_modules/.bin/playwright test --list
git diff --check
```

Expected: TypeScript succeeds, every intended test appears in discovery, and no whitespace errors exist.

Also validate `TEST_LOCALE` against `en`, `pl`, `de`, `es`, and `ar`, and make `localePath()` recognize all five already-prefixed locales. Remove unused imports, parameters, screenshot helpers, and dead Page Object methods that fail the public package's strict `noUnusedLocals`/`noUnusedParameters` check.

### Task 4: Fix Portfolio Application Defects and Public-Link Behavior Test-First

**Files:**
- Modify: `portfolio/components/testing-strategy.tsx`
- Modify: `portfolio/lib/projects-data.ts`
- Modify: `portfolio/components/projects.tsx`
- Modify: `portfolio/app/[locale]/projects/[slug]/page.tsx`
- Modify if copy changes: `portfolio/messages/{en,pl,de,es,ar}.json`
- Test: relevant `portfolio/tests/*.spec.ts` and page objects

**Interfaces:**
- Produces project fields `github: string`, `demo: string`, `hasPublicCode: boolean`, and `hasDemo: boolean`.
- Public projects render a normal external Code link; private projects render `data-testid="private-code-button"` and retain the bug-hunt interaction.
- Testing-page actions use the same public URLs as `demo-testing-suite`.

- [ ] **Step 1: Add failing CTA and asset tests**

Add assertions that:

```ts
const suiteCard = page.getByTestId('project-card').filter({ hasText: /Demo Testing Suite/i });
await expect(suiteCard.getByRole('link', { name: /code/i })).toHaveAttribute(
  'href',
  'https://github.com/Vicoold/cv_project/tree/master/portfolio-playwright',
);
await expect(suiteCard.getByRole('link', { name: /demo/i })).toHaveAttribute(
  'href',
  'https://github.com/Vicoold/cv_project/actions/workflows/portfolio-playwright.yml',
);
```

Also assert that the Testing page has those two links, its showcased images return successful responses, and at least one private project still exposes `private-code-button` rather than a public repository link.

Create `tests/project-links.spec.ts` and identify cards with `data-project-slug`. Verify exact `href`, `target="_blank"`, and `rel="noopener noreferrer"` values without navigating away to GitHub. Cover the test-suite card/detail/Testing page plus an explicitly selected `bug-the-gathering` private control.

- [ ] **Step 2: Run the new focused tests and observe failure**

Run the exact modified spec on Chromium with one worker and no retries. Expected: current disabled/private controls and missing `testing_site_*` images fail the new assertions.

- [ ] **Step 3: Correct the project data**

Set `demo-testing-suite` to:

```ts
github: "https://github.com/Vicoold/cv_project/tree/master/portfolio-playwright",
demo: "https://github.com/Vicoold/cv_project/actions/workflows/portfolio-playwright.yml",
hasPublicCode: true,
hasDemo: true,
```

Set `hasPublicCode: false` on the other two projects.

- [ ] **Step 4: Render public and private Code actions explicitly**

In the project card and detail page, branch on `project.hasPublicCode`. The public branch is an external anchor with `target="_blank"`, `rel="noopener noreferrer"`, the existing Code label, and a GitHub icon. The private branch retains its tooltip and bug-hunt click behavior. Render Demo independently through `hasDemo` so the test suite exposes both actions rather than replacing Code with Demo.

Use wrapping or a responsive grid for Code, Demo, and Details so all three actions remain usable on narrow cards and in Arabic RTL. Do not select a private Bug 4 trigger with `.first()`; target the `bug-the-gathering` card explicitly.

- [ ] **Step 5: Replace the Testing-page disabled buttons with anchors**

Remove the tilt state and `foundBug(4)` behavior from these two controls only. Link Code and CI to the approved public URLs with external-link safety attributes. Remove now-unused state and callback imports.

- [ ] **Step 6: Fix the missing images at their owning reference**

Replace `/testing_site_dark.png` and `/testing_site_light.png` with the existing `/tests-screenshot.png` when that image represents the intended structure screenshot, or add correctly named committed assets only if distinct source images actually exist. Do not leave requests that return 404.

- [ ] **Step 7: Prevent raw translation keys on project detail pages**

For `demoTestingSuite`, ensure German, Spanish, and Arabic provide `longDescription`, `features`, and `challenges`, or implement and test an intentional English fallback. Assert that all five localized detail pages contain real copy rather than `projects.items.demoTestingSuite.*` keys.

- [ ] **Step 8: Run the focused regression tests**

Run the modified specs on Chromium, then repeat on one mobile project. Expected: public links and images pass; private-project behavior remains covered.

### Task 5: Verify and Commit the Complete Source Portfolio Repair

**Files:**
- All modified files under `/Users/pdolinski/web/portfolio`.

**Interfaces:**
- Produces a clean, committed source suite that can be mirrored without manual adaptation of test logic.

- [ ] **Step 1: Install the complete Playwright browser matrix if missing**

Run:

```bash
npx playwright install chromium firefox webkit
```

Expected: local executables exist for all configured projects.

- [ ] **Step 2: Run static and production-build checks**

Run:

```bash
npx tsc --noEmit
npm run build
```

Expected: both commands exit zero with no missing-image or type errors.

- [ ] **Step 3: Run the complete five-project source suite**

Run:

```bash
node_modules/.bin/playwright test --workers=5 --retries=0 --reporter=line
```

Expected: all discovered executions pass across Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari.

- [ ] **Step 4: Review generated files and commit only source changes**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Do not stage reports, traces, screenshots, videos, `.next`, or test result JSON. Commit the verified application/test repair in `/Users/pdolinski/web` with:

```bash
git add portfolio
git commit -m "fix: harden portfolio tests and publish test links"
```

### Task 6: Create and Verify the Standalone Public Playwright Package

**Files:**
- Create all files under `portfolio-playwright/`
- Create `.github/workflows/portfolio-playwright.yml`

**Interfaces:**
- Consumes: verified test files from `/Users/pdolinski/web/portfolio/tests`.
- Produces: `npm test` and `npm run test:ci`, both targeting `BASE_URL` or production by default.

- [ ] **Step 1: Copy the verified tests mechanically**

Copy all TypeScript files under `tests/` only after Task 5 passes; do not copy `tests/README.md`. Confirm the mirrored TypeScript file list and checksums match:

```bash
find /Users/pdolinski/web/portfolio/tests -type f -name '*.ts' | sort
find /Users/pdolinski/cv_project/portfolio-playwright/tests -type f -name '*.ts' | sort
```

- [ ] **Step 2: Create a minimal standalone package manifest**

Use scripts equivalent to:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ci": "playwright test --reporter=line,html"
  },
  "devDependencies": {
    "@axe-core/playwright": "4.11.0",
    "@playwright/test": "1.58.1",
    "@types/node": "20.19.30",
    "typescript": "5.9.3"
  }
}
```

Mark the package private to prevent accidental registry publication. Generate `package-lock.json` from this manifest and verify installation with `npm ci`.

- [ ] **Step 3: Create the remote-only Playwright configuration**

Set `baseURL: process.env.BASE_URL ?? 'https://piotrdolinski.com'`, keep the five verified projects, use zero retries, retain failure artifacts, and omit `webServer`. Use an ignored output directory for all generated files.

- [ ] **Step 4: Create the public workflow**

The workflow must run a five-entry matrix from `portfolio-playwright`, use Node 20, `npm ci`, install only the matrix entry's browser with `npx playwright install --with-deps`, typecheck, and run the named project with one worker. Trigger it on pushes that touch the package or workflow, pull requests, manual dispatch, and a restrained scheduled check. Use `fail-fast: false`; upload each project's HTML report and test-results directory with `if: always()` and a 14-day retention period.

- [ ] **Step 5: Write accurate public documentation**

Include install/run commands, `BASE_URL` override, test categories, five browser/device projects, failure artifacts, CI link, source-of-truth note, and limitations. Do not state an exact number of tests, fixed duration, zero flakiness, or complete accessibility compliance.

- [ ] **Step 6: Verify the package independently**

Run from `portfolio-playwright`:

```bash
npm ci
npx tsc --noEmit
npx playwright test --list
BASE_URL=http://127.0.0.1:3000 npm test -- --workers=5 --retries=0 --reporter=line
```

Expected: dependency installation, type checking, discovery, and all black-box executions against the separately running verified local production build succeed without importing its source. The production-URL run is repeated after deployment in Task 8.

### Task 7: Update and Render the CV

**Files:**
- Modify: `Piotr_Dolinski_SDET_CV_EN.html`
- Replace: `output/pdf/Piotr_Dolinski_CV.pdf`

**Interfaces:**
- Consumes: the verified public package URL and inspected BUG test evidence.
- Produces: one two-page English CV with selectable text and public test link.

- [ ] **Step 1: Apply the approved factual copy changes**

Use `Senior SDET / QA Lead | Mobilum Pay`. Replace the AI bullet with a concise statement naming Claude, Gemini, Codex, Grok, an internal locally hosted open-source LLM platform, and the TDD skill integrated into an internal Codex-based platform, tied to test generation/maintenance, failure and log analysis, and automation/framework work.

Use this BUG direction without counts:

```html
<li>Developing features and defect fixes through a test-first/TDD workflow, with focused Jest component-level and regression coverage across the combat engine, state stores and React/Skia presentation layer, enforced in pull-request CI.</li>
```

Change the Playwright anchor to the public code URL and use `margin-bottom: 0` on `.skills-container`.

- [ ] **Step 2: Run content and link checks**

Run:

```bash
rg -n "Senior SDET / QA Lead|Claude|Gemini|Codex|Grok|open-source LLM|test-first/TDD|cv_project/tree/master/portfolio-playwright|margin-bottom: 0" Piotr_Dolinski_SDET_CV_EN.html
! rg -n "github.com/Vicoold/web|approximately 200|40–60|4–6|Running 65" Piotr_Dolinski_SDET_CV_EN.html
git diff --check
```

- [ ] **Step 3: Regenerate the PDF from the HTML source**

Use the repository's established WeasyPrint workflow to write `output/pdf/Piotr_Dolinski_CV.pdf`. Do not edit the PDF independently from the HTML source.

- [ ] **Step 4: Verify PDF structure, text, and layout**

Run `pdfinfo`, `pdftotext`, and `pdftoppm`. Require exactly two A4 pages, confirm the new role/public URL/TDD and AI terms in extracted text, and inspect both rendered page images for clipping, overlap, orphaned headings, or awkward entry splits.

### Task 8: Final Review, Commit, Publish, and Verify Remotely

**Files:**
- All intended changes in `/Users/pdolinski/cv_project` and `/Users/pdolinski/web/portfolio`.

**Interfaces:**
- Produces public GitHub URLs and deployed portfolio CTAs that have been verified after publication.

- [ ] **Step 1: Run final local review in both repositories**

Run `git diff --check`, inspect the complete diffs, and confirm no private URL, generated test artifact, secret, unrelated edit, or accidental binary exists outside the intended PDF.

- [ ] **Step 2: Commit the public package and CV**

In `/Users/pdolinski/cv_project`, stage only the package, workflow, HTML, and PDF. Commit with:

```bash
git commit -m "feat: publish portfolio test showcase"
```

- [ ] **Step 3: Push the CV repository**

Push `master` and confirm the public Code and workflow URLs exist. The automatic workflow may race the still-old production deployment; do not treat that run as the final remote gate.

- [ ] **Step 4: Push the portfolio repository**

After the public URLs resolve, push `/Users/pdolinski/web` `master`. Wait for its available CI/deployment checks and the current production deployment.

- [ ] **Step 5: Run the final public workflow against current production**

Dispatch or rerun `portfolio-playwright.yml` after deployment. Require every matrix project to pass against `https://piotrdolinski.com`; diagnose any failure before claiming completion.

- [ ] **Step 6: Verify the deployed user experience**

On `https://piotrdolinski.com`, verify the test-suite project card, project detail page, and Testing page expose working Code and Demo links. Confirm a private project still shows the private-code affordance.

- [ ] **Step 7: Record exact outcomes**

Report local source-suite, public-package, PDF, remote GitHub Actions, and deployed-site results separately. If a remote service blocks verification, name that gate as unverified rather than inferring success from the push.
