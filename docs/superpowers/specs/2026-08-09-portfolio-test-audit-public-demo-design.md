# Portfolio Test Audit and Public Demo Design

## Objective

Audit and repair the Playwright suite and the portfolio application at their private source, then publish a self-contained black-box copy of the verified suite inside the public CV repository. Update the portfolio and CV so recruiters can inspect the public test code and run history without exposing the private portfolio repository.

## Repositories and Ownership

- Portfolio application and test source of truth: `/Users/pdolinski/web/portfolio` in the `web` repository.
- Public showcase and CV: `/Users/pdolinski/cv_project`.
- BUG: The Gathering: `/Users/pdolinski/BUG--The-Gathering---mobile`, inspected only as evidence for CV copy.
- The portfolio suite must be fixed at source before any files are copied to the public repository.
- The public package is a demonstration mirror. Future functional changes begin in the portfolio source and are copied only after source verification.

## Scope

### Source audit and repair

Inspect every Playwright specification, page object, helper, selector, assertion, wait, timeout, configuration entry, CI assumption, and documentation claim. Classify each issue as one of:

1. Application defect.
2. Test defect.
3. Test configuration or infrastructure defect.
4. Stale or inaccurate documentation.

Fix the root cause in the owning layer. Do not make the suite green by adding retries, globally increasing timeouts, swallowing failures, or replacing assertions with weaker checks.

Known issues that must be addressed:

- Replace the ambiguous `text=PL` locator with `getByTestId('language-option-pl')` and verify the localized URL using a web-first assertion.
- Remove the swallowed language-navigation timeout and arbitrary post-click delay.
- Make the mobile localization path open the hamburger menu and perform real assertions instead of passing when the desktop switcher is hidden.
- Remove the redundant `BasePage.goto()` load-state sequence. `page.goto()` already waits for the load event, while the caught `networkidle` wait wastes five seconds and causes the full navigation scenario to exceed its test budget under parallel load.
- Replace any exact assertion that the suite contains `65` tests with a stable statement about the suite or report.
- Find and correct the references to the missing `testing_site_light.png` and `testing_site_dark.png` assets.
- Remove false-green conditional branches and replace fragile sleeps or `networkidle` waits with observable URL, element, or state assertions wherever the application exposes one.
- Correct README claims that cannot be verified, including fixed execution times, permanent absence of flaky tests, complete WCAG compliance, stale repository paths, and obsolete file trees.

### Public black-box package

Create `/Users/pdolinski/cv_project/portfolio-playwright` with only the files required to install and run the tests against a deployed URL:

```text
portfolio-playwright/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
└── tests/
    ├── *.spec.ts
    ├── pages/*.ts
    └── utils/*.ts
```

The package must:

- Default `BASE_URL` to `https://piotrdolinski.com`.
- Accept an explicit `BASE_URL` override.
- Have no dependency on the private Next.js source tree, its build command, its local development server, or private environment variables.
- Keep the verified desktop and mobile browser projects.
- Produce an HTML report and machine-readable CI output without tracking generated reports, results, screenshots, traces, or browser binaries.
- Document what is actually checked and distinguish automated axe checks from a complete accessibility audit or certification.

Add `.github/workflows/portfolio-playwright.yml` in the CV repository. It must install dependencies and Playwright browsers reproducibly, run the public package against production, retain the HTML report and failure evidence as artifacts, and expose a stable workflow page that can serve as the public demo link.

## Public Links and Portfolio Data

Use these stable URLs:

- Code: `https://github.com/Vicoold/cv_project/tree/master/portfolio-playwright`
- Demo/run history: `https://github.com/Vicoold/cv_project/actions/workflows/portfolio-playwright.yml`

Extend the portfolio project data model with an explicit public-code capability instead of inferring it from the presence of a repository URL. For `demo-testing-suite`, expose both Code and Demo links in:

- The project card.
- The project detail page.
- The Testing page.

Keep the existing private-code treatment for projects whose repositories remain private. Reuse existing translated labels where their meaning remains accurate; update all five locales if a new key or changed sentence is required.

## CV Changes

Preserve the current two-page design and section structure while making these focused edits:

- Change the Mobilum role title to `Senior SDET / QA Lead | Mobilum Pay` so it aligns with the visible Senior SDET positioning and the actual scope of the role.
- Replace the generic AI bullet with a concrete statement that names Claude, Gemini, Codex, Grok, the internal locally hosted open-source LLM platform, and the TDD skill integrated into the internal Codex-based platform. Tie them to actual test design and generation, maintenance, failure/log analysis, and automation or framework work; do not claim an invented productivity gain.
- Set `.skills-container` bottom margin to zero so `.skills-groups { gap: 10px; }` is the only vertical spacing between expertise groups.
- Replace the private portfolio-test link with the public package URL.
- Describe BUG: The Gathering as using a test-first/TDD workflow with focused Jest component-level and regression coverage across the combat engine, state stores, and React/Skia presentation, enforced in pull-request CI.
- Do not include volatile exact test counts or execution-duration estimates in the CV.

## Verification Gates

Publication is allowed only after all applicable gates pass:

1. Portfolio static checks and production build pass.
2. The complete source Playwright suite passes on Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari.
3. The copied public package installs from its lockfile and passes as a black-box suite against `https://piotrdolinski.com`.
4. The CV HTML passes content checks and `git diff --check`.
5. The regenerated CV PDF contains exactly two A4 pages, selectable text, working public URLs, no clipped content, and no broken page layout when rendered to images.
6. After pushing the CV repository, its public GitHub Actions workflow passes and both Code and Demo URLs resolve.
7. After pushing the portfolio repository, its own checks pass and the deployed site exposes the intended Code and Demo actions without changing the private status of other projects.

If a remote CI or deployment service is unavailable, retain the verified local commits, report the external blocker precisely, and do not describe the remote gate as passed.

## Commit and Publication Order

1. Commit this design and the implementation plan in the CV repository.
2. Commit source test and application repairs in the `web` repository.
3. Commit the public package and CV artifacts in the CV repository.
4. Push the CV `master` branch and verify the public package workflow and URLs.
5. Commit or finalize the portfolio link changes against the now-public URLs.
6. Push the `web` `master` branch and verify its CI/deployment.

All unrelated user changes must remain untouched. Generated test output must not be committed unless it is an intentional published artifact described above.

## Non-Goals

- Do not publish the private portfolio repository.
- Do not copy the portfolio application source into the CV repository.
- Do not modify BUG: The Gathering.
- Do not create a second CV variant or materially redesign the current CV.
- Do not add invented metrics, reliability claims, compliance claims, or private system details beyond the user-approved technology names.

## Acceptance Criteria

- The source suite contains no known false-green language scenario, swallowed navigation assertion, redundant global load helper, or stale exact suite-size claim.
- Real portfolio defects discovered by the audit are fixed in application code and protected by a regression test where practical.
- The standalone public package can be cloned, installed, and run without access to the private `web` repository.
- Recruiters can reach public Code and Demo pages from the CV, project card, project detail page, and Testing page.
- Other projects still communicate that their code is private.
- The updated CV remains an English, two-page, ATS-readable hybrid Senior SDET/SWE/QA Lead document.
- Local and remote verification results are recorded honestly, with no failure hidden by retries, broad timeouts, or conditional early exits.
