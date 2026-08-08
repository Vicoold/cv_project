# Hybrid SDET CV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the current English CV as one evidence-led Senior SDET/SWE/QA-leadership document while preserving its existing visual identity and producing a verified two-page PDF.

**Architecture:** Keep the existing single-file HTML/CSS implementation. Replace generic copy with approved, factual content; add only the small semantic/CSS structures needed for a visible headline, grouped expertise, reliable A4 pagination, and text extraction. Render the final HTML to PDF with a temporary WeasyPrint installation, then validate all pages visually and with Poppler text extraction.

**Tech Stack:** HTML5, CSS3, Font Awesome fallback-safe text, WeasyPrint, Poppler (`pdfinfo`, `pdftoppm`, `pdftotext`), Git.

## Global Constraints

- Source file: `/Users/pdolinski/cv_project/Piotr_Dolinski_SDET_CV_EN.html`.
- Design source: `/Users/pdolinski/cv_project/docs/superpowers/specs/2026-08-08-hybrid-sdet-cv-design.md`.
- Preserve the blue palette, single-column layout, section headings, left-border entries, skill tags, typography, contact block, and portfolio link.
- Use one hybrid CV with primary SDET/SWE positioning and credible QA leadership.
- Do not include exact test counts, estimated regression durations, invented metrics, direct reports, publication status, or private repository links.
- Keep only stable contextual numbers such as `10+ years` and `five engineering teams`.
- Do not deploy the CV or update the separate portfolio repository.
- Final print output must contain no more than two A4 pages and must not split individual job/project entries awkwardly.

---

## File Map

- Modify: `Piotr_Dolinski_SDET_CV_EN.html` — all CV content, screen styling, and print styling.
- Create: `output/pdf/Piotr_Dolinski_CV.pdf` — final selectable-text PDF artifact.
- Temporary only: `tmp/pdfs/` — rendered PDF/PNG QA files; remove PNGs after final verification.

### Task 1: Rewrite the CV Content and Semantic Structure

**Files:**
- Modify: `Piotr_Dolinski_SDET_CV_EN.html:1-381`

**Interfaces:**
- Consumes: the approved content in `docs/superpowers/specs/2026-08-08-hybrid-sdet-cv-design.md`.
- Produces: semantic HTML sections and class names `.headline`, `.skills-groups`, `.skills-group`, and `.skills-label` for Task 2 styling.

- [ ] **Step 1: Confirm the current source and baseline gaps**

Run:

```bash
git status --short
rg -n "Independent Projects|Results-oriented|approximately 200|40–60|4–6|Senior SDET \| Software Engineering" Piotr_Dolinski_SDET_CV_EN.html
```

Expected: the worktree contains only committed planning documents; the CV still contains `Independent Projects` and `Results-oriented`, and does not yet contain the new visible headline or vanity metrics.

- [ ] **Step 2: Remove hidden source comments and add the visible headline**

Use this header structure:

```html
<header>
  <h1>Piotr Doliński</h1>
  <p class="headline">Senior SDET | Software Engineering &amp; Quality Leadership</p>
  <div class="contact">
    <!-- Preserve the existing location, email, phone, portfolio and LinkedIn text/links. -->
  </div>
</header>
```

Update the document title to:

```html
<title>Piotr Doliński - Senior SDET | Software Engineering &amp; Quality Leadership</title>
```

Delete the four comments that combine into `Probably the best Tester Money can buy!`.

- [ ] **Step 3: Replace the professional summary**

Use exactly this working copy unless line wrapping requires HTML-only formatting:

```html
<p>
  Senior SDET with <strong>10+ years of experience</strong> in quality engineering, test automation and hands-on software development across fintech, payments and public-sector systems. As the first and sole QA at Mobilum Pay, I own quality strategy and automation across five engineering teams, a distributed API platform and mobile/web products. I build REST Assured, Detox and Cypress coverage enforced by a required GitHub Actions quality gate on every pull request. Outside work, I build React Native, Expo and Next.js products, combining software engineering with quality leadership.
</p>
```

- [ ] **Step 4: Replace the flat technical stack with grouped expertise**

Use this structure and content:

```html
<div class="skills-groups">
  <div class="skills-group">
    <span class="skills-label">Programming &amp; Product Engineering</span>
    <div class="skills-container">TypeScript, Java, React, Next.js, React Native and Expo skill tags</div>
  </div>
  <div class="skills-group">
    <span class="skills-label">Test Automation</span>
    <div class="skills-container">Playwright, Detox, Cypress, Selenium WebDriver, REST Assured, Maestro, Cucumber, Jest and Appium skill tags</div>
  </div>
  <div class="skills-group">
    <span class="skills-label">CI, Data &amp; Tooling</span>
    <div class="skills-container">GitHub Actions, Jenkins, Git, Docker, Postman, SQL and Kibana skill tags</div>
  </div>
  <div class="skills-group">
    <span class="skills-label">Quality Leadership</span>
    <div class="skills-container">Test Strategy, Quality Gates, Release Readiness, E2E, API, Mobile and Web Testing skill tags</div>
  </div>
</div>
```

Render each comma-separated item above as the existing `<span class="skill-tag">...</span>` element; do not leave prose inside `.skills-container`.

- [ ] **Step 5: Rewrite professional experience with factual scope**

Use the following bullets.

Mobilum Pay:

```html
<li>Joined as the company's first QA engineer and remain the sole owner of quality strategy, release criteria, test environments, defect management, reporting and go/no-go decisions across five engineering teams.</li>
<li>Built and maintain REST Assured API automation, Detox coverage of critical React Native interactions and Cypress web suites across the company's distributed fintech platform.</li>
<li>Designed a required GitHub Actions quality gate that builds the application and runs automated API, mobile and web checks on every pull request before merge.</li>
<li>Developed AI-assisted workflows for test design, maintenance and regression analysis to extend the capacity of a one-person quality function.</li>
```

Nexio Management:

```html
<li>Owned end-to-end, exploratory, regression and release testing for public-sector web applications, including complex test data preparation and technical demonstrations for client stakeholders.</li>
<li>Developed Selenium WebDriver and REST Assured smoke tests executed with each release and used Postman for API validation.</li>
```

Clear2Pay Poland:

```html
<li>Automated regression testing for customized implementations of a core payment platform using Java, Cucumber, Selenium WebDriver and REST Assured, executed in Jenkins.</li>
<li>Standardized automation practices, mentored junior QA engineers and served as Scrum Master for one year.</li>
```

Rename the grouped entry to `Earlier QA Roles | Altkom, Lionbridge &amp; Testronic`. Convert every date to a consistent English format using ASCII hyphens:

```text
Feb 2025 - Present
Apr 2021 - Jan 2025
Aug 2018 - Apr 2021
Oct 2015 - Aug 2018
2015 - 2017
```

Keep the earlier companies grouped because the exact per-company dates are unavailable.

- [ ] **Step 6: Rewrite Selected Engineering Projects**

Rename the section to `Selected Engineering Projects` and use these entries.

Portfolio & Public Test Suite:

```html
<li>Designed and built a multilingual Next.js and TypeScript portfolio supporting five locales, localized routing and metadata, dark mode, responsive behavior and RTL Arabic.</li>
<li>Created a Playwright E2E suite executed across desktop and mobile browser profiles, covering critical journeys, axe-core/WCAG accessibility, responsiveness, localization and SEO in GitHub Actions.</li>
```

BUG: The Gathering:

```html
<li>Building an offline-first React Native and Expo roguelike deckbuilder with a deterministic TypeScript combat engine, seeded progression, five classes, hundreds of card definitions, Zustand persistence and Skia/Reanimated rendering.</li>
<li>Developed a broad Jest regression suite covering combat rules, balance simulations, content and localization consistency, animation timing and previously observed failures, executed in pull-request CI.</li>
```

Private Language-Learning Platform:

```html
<li>Co-developing a private React Native and Expo language-learning product, owning QA strategy and Maestro E2E automation while contributing production bug fixes.</li>
<li>Implemented an end-to-end notification capability across the mobile application, React/Vite CMS and NestJS/Prisma API, including Firebase/FCM token registration, delivery and notification navigation flows.</li>
```

Do not add private repository links or claim that either private mobile product is published.

- [ ] **Step 7: Consolidate education, certifications and language**

Use official names and no guessed dates:

```html
<li><strong>Scrum Alliance Certified ScrumMaster (CSM)</strong></li>
<li><strong>ISTQB Certified Tester Foundation Level (CTFL)</strong></li>
<li><strong>Technical Training:</strong> Java for Testers, Linux for Testers - Sages</li>
<li><strong>English:</strong> Professional working proficiency; used daily in an international environment</li>
```

Rename the section to `Certifications, Education &amp; Languages`. Use `Computer Science coursework - four semesters` for education and remove the high-school entry. Replace the footer copy with exactly:

```html
I hereby give consent for my personal data included in my application to be processed for recruitment purposes.
```

- [ ] **Step 8: Verify content and commit Task 1**

Run:

```bash
rg -n "Senior SDET \| Software Engineering &amp; Quality Leadership|Selected Engineering Projects|first QA engineer|five engineering teams|REST Assured API automation|Private Language-Learning Platform|Professional working proficiency" Piotr_Dolinski_SDET_CV_EN.html
! rg -n "approximately 200|40–60|4–6|High School Diploma|Results-oriented|Money can buy|Probably|The best|Tester-->" Piotr_Dolinski_SDET_CV_EN.html
git diff --check
```

Expected: every required phrase is present, every banned phrase is absent, and `git diff --check` reports no errors.

Commit:

```bash
git add Piotr_Dolinski_SDET_CV_EN.html
git commit -m "feat: rewrite CV for hybrid SDET positioning"
```

### Task 2: Preserve and Tighten the Existing Visual Design

**Files:**
- Modify: `Piotr_Dolinski_SDET_CV_EN.html:13-191`

**Interfaces:**
- Consumes: `.headline`, `.skills-groups`, `.skills-group`, and `.skills-label` markup from Task 1.
- Produces: screen and A4 print styles consumed by the PDF-rendering task.

- [ ] **Step 1: Add only the required new screen styles**

Add:

```css
.headline {
  margin: 5px 0 0;
  color: var(--secondary-color);
  font-size: 12pt;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.skills-groups {
  display: grid;
  gap: 10px;
}

.skills-group {
  break-inside: avoid;
}

.skills-label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-light);
  font-size: 9pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

Keep the existing palette, fonts, borders, badges, contact layout and `.skill-tag` appearance.

- [ ] **Step 2: Add deterministic A4 print rules**

Replace the current print block with:

```css
@page {
  size: A4;
  margin: 10mm 12mm;
}

@media print {
  body {
    max-width: none;
    margin: 0;
    padding: 0;
    font-size: 9.5pt;
    line-height: 1.35;
  }

  header {
    margin-bottom: 12px;
    padding-bottom: 10px;
  }

  h2 {
    margin-top: 18px;
    margin-bottom: 9px;
  }

  .job-entry {
    margin-bottom: 13px;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .skills-groups,
  .skills-group,
  footer {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  a {
    color: inherit;
  }

  .skill-tag:hover {
    transform: none;
    box-shadow: none;
  }
}
```

Adjust only numeric spacing values if the verified output exceeds two pages or creates excessive whitespace. Do not redesign the layout.

- [ ] **Step 3: Verify CSS structure and commit Task 2**

Run:

```bash
rg -n "\.headline|\.skills-groups|@page|size: A4|break-inside: avoid" Piotr_Dolinski_SDET_CV_EN.html
git diff --check
```

Expected: all selectors and A4 rules are present; no whitespace errors.

Commit:

```bash
git add Piotr_Dolinski_SDET_CV_EN.html
git commit -m "style: preserve and tighten CV print layout"
```

### Task 3: Render and Verify the Final PDF

**Files:**
- Create: `output/pdf/Piotr_Dolinski_CV.pdf`
- Temporary: `tmp/pdfs/cv-page-*.png`
- Modify if visual QA fails: `Piotr_Dolinski_SDET_CV_EN.html`

**Interfaces:**
- Consumes: final HTML/CSS from Tasks 1 and 2.
- Produces: a two-page selectable-text PDF and visual QA evidence.

- [ ] **Step 1: Prepare local output and temporary directories**

Run:

```bash
mkdir -p output/pdf tmp/pdfs /private/tmp/cv-weasyprint
```

- [ ] **Step 2: Install WeasyPrint into the temporary dependency directory if absent**

Run:

```bash
/Users/pdolinski/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -m pip install --target /private/tmp/cv-weasyprint weasyprint
```

Expected: installation succeeds without changing project dependency files.

- [ ] **Step 3: Render the HTML to PDF**

Run:

```bash
/Users/pdolinski/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -c 'import sys; sys.path.insert(0, "/private/tmp/cv-weasyprint"); from weasyprint import HTML; HTML(filename="Piotr_Dolinski_SDET_CV_EN.html", base_url=".").write_pdf("output/pdf/Piotr_Dolinski_CV.pdf")'
```

Expected: `output/pdf/Piotr_Dolinski_CV.pdf` exists and is non-empty.

- [ ] **Step 4: Verify page count and text extraction**

Run:

```bash
/Users/pdolinski/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdfinfo output/pdf/Piotr_Dolinski_CV.pdf | rg '^Pages:'
/Users/pdolinski/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftotext output/pdf/Piotr_Dolinski_CV.pdf - | rg "Senior SDET|Selected Engineering Projects|Mobilum Pay|BUG: The Gathering|Professional working proficiency"
```

Expected: exactly two pages and all required text extracts in logical reading order.

- [ ] **Step 5: Render every page to PNG and inspect visually**

Run:

```bash
/Users/pdolinski/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm -png -r 150 output/pdf/Piotr_Dolinski_CV.pdf tmp/pdfs/cv-page
```

Inspect every generated PNG. Require: no clipped or overlapping text, no stranded headings, consistent margins, readable contact details, intact blue hierarchy, balanced page density and no awkward job/project splits.

- [ ] **Step 6: Iterate if visual or extraction checks fail**

Change only print spacing, font size, or page-break rules in the HTML; rerender the PDF; repeat Steps 4 and 5 until all checks pass.

- [ ] **Step 7: Run final repository checks and commit the PDF**

Run:

```bash
git diff --check
git status --short
```

Remove temporary PNG files after inspection. Keep the final PDF.

Commit:

```bash
git add Piotr_Dolinski_SDET_CV_EN.html output/pdf/Piotr_Dolinski_CV.pdf
git commit -m "feat: add verified hybrid SDET CV"
```
