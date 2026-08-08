# Hybrid SDET / Software Engineering CV Design

## Objective

Rewrite Piotr Doliński's English CV as one hybrid document aimed primarily at Senior SDET roles while remaining credible for QA Lead, Test Lead, Senior QA Automation Engineer, and engineering-heavy quality roles in international companies in Poland.

The CV must present Piotr as an engineer with end-to-end quality ownership, not as a manual tester with a list of automation tools. It must also show that his software engineering work is substantial and current.

## Source of Truth

- Current CV: `/Users/pdolinski/cv_project/Piotr_Dolinski_SDET_CV_EN.html`
- Portfolio: `/Users/pdolinski/web/portfolio`
- BUG: The Gathering: `/Users/pdolinski/BUG--The-Gathering---mobile`
- Private language-learning platform: `/Users/pdolinski/ijc/ijc-monorepo`

The older copy under `/Users/pdolinski/Documents/cv_project` is stale and must not be used as the implementation source.

## Positioning

Use this visible headline below the candidate's name:

> Senior SDET | Software Engineering & Quality Leadership

The narrative hierarchy is:

1. Senior SDET and automation engineer.
2. Hands-on software engineer building real TypeScript, React Native, Expo, and Next.js products.
3. QA Lead-level owner of strategy, release readiness, and quality processes, without claiming formal people management.

## Summary Direction

Use this evidence-led summary as the implementation draft:

> Senior SDET with 10+ years of experience in quality engineering, test automation, and hands-on software development across fintech, payments, and public-sector systems. First and sole QA at Mobilum Pay, owning quality strategy and automation across five engineering teams, approximately 10 developers, approximately 10 API services, and mobile/web products. Built pull-request-gated CI coverage with approximately 200 REST Assured API tests, approximately 40 Detox mobile E2E scenarios, and Cypress web suites, replacing an estimated 4–6 hours of manual regression with a 40–60-minute pipeline. Builds React Native, Expo, and Next.js products, combining software engineering with quality leadership.

It must preserve these facts:

- 10+ years in quality engineering and test automation.
- Hands-on software development across fintech, payments, public-sector systems, mobile, and web.
- First and sole QA at Mobilum Pay.
- Quality ownership across five teams, approximately ten developers, approximately ten API services, and mobile/web products.
- Approximately 200 REST Assured API tests, approximately 40 Detox mobile E2E scenarios, and Cypress web suites.
- A pull-request quality gate completing the mobile build and automated regression in 40–60 minutes, replacing an estimated 4–6 hours of equivalent manual regression.
- Current React Native/Expo and Next.js engineering projects.

Avoid unsupported adjectives such as `expert`, `robust`, `strategic`, and `multiplying throughput` when no evidence follows them.

## Section Order

1. Header: name, headline, location, email, phone, portfolio, LinkedIn.
2. Professional Summary.
3. Core Expertise, grouped by category.
4. Professional Experience.
5. Selected Engineering Projects.
6. Certifications, Education & Languages.
7. Short English recruitment-consent footer for applications in Poland.

## Core Expertise

Group the existing skill tags instead of presenting one undifferentiated list:

- Programming & Product Engineering: TypeScript, Java, React, Next.js, React Native, Expo.
- Test Automation: Playwright, Detox, Cypress, Selenium WebDriver, REST Assured, Maestro, Cucumber, Jest, Appium.
- CI, Data & Tooling: GitHub Actions, Jenkins, Git, Docker, Postman, SQL, Kibana.
- Quality Leadership: test strategy, quality gates, release readiness, exploratory testing, E2E, API, mobile, and web testing.

Only technologies supported by professional experience or inspected projects should remain prominent.

## Professional Experience Content

### Mobilum Pay

Use four evidence-led bullets:

- Joined as the company's first QA engineer and remains the sole owner of quality strategy, release criteria, environments, defect management, reporting, and go/no-go decisions across five engineering teams and approximately ten developers.
- Built and maintains automated coverage for approximately ten API services and mobile/web products: approximately 200 REST Assured API tests, approximately 40 Detox E2E scenarios covering the critical React Native interactions, and Cypress web suites.
- Designed a GitHub Actions pull-request quality gate that builds the mobile app and runs the automated suites in 40–60 minutes, replacing an estimated 4–6 hours of equivalent manual regression.
- Include a restrained AI-assisted QA bullet describing test design, maintenance, and regression analysis, without an invented productivity percentage.

Omit the detailed product description because the application is being withdrawn/rebranded. The fintech domain is already represented in the summary.

### Nexio Management

Represent this honestly as a predominantly manual role:

- End-to-end, exploratory, regression, and release testing of public-sector web applications, including test data and stakeholder demonstrations.
- Selenium WebDriver and REST Assured smoke tests executed with each release; Postman for API validation.

Do not imply that full regression was automated.

### Clear2Pay Poland

- Automated regression for customized implementations of a core payment platform using Java, Cucumber, Selenium WebDriver, and REST Assured in Jenkins.
- Standardized automation practices, mentored junior QA engineers, and served as Scrum Master for one year.

### Earlier Roles

Keep Altkom, Lionbridge, and Testronic grouped as `Earlier QA Roles | 2015–2018` because exact per-company dates are unavailable. Do not invent chronology.

## Selected Engineering Projects

Rename `Independent Projects` to `Selected Engineering Projects`.

### BUG: The Gathering

Use two concise bullets demonstrating both SWE and quality engineering:

- Offline-first React Native/Expo roguelike deckbuilder with a deterministic TypeScript combat engine, seeded progression, five classes, 400+ card definitions, Zustand persistence, and Skia/Reanimated rendering.
- A large Jest regression suite covering combat rules, balance simulations, content/localization consistency, animation timing, and previously observed failures, executed in pull-request CI.

Do not claim store publication, production users, or business results. Use `400+ card definitions` instead of a volatile exact count.

### Private Language-Learning Platform

Use two bullets:

- Co-develops a private React Native/Expo language-learning product, owning QA strategy and Maestro E2E automation while contributing production bug fixes.
- Implemented an end-to-end notification capability across the mobile application, React/Vite CMS, and NestJS/Prisma API, including Firebase/FCM token registration, delivery, and notification navigation flows.

Keep the product generic and do not link private repositories.

### Portfolio & Public Test Suite

Use two bullets:

- Designed and built a multilingual Next.js/TypeScript portfolio supporting five locales, localized routing and metadata, dark mode, responsive behavior, and RTL Arabic.
- Created 67 logical Playwright E2E tests across five desktop/mobile browser profiles, covering critical journeys, accessibility with axe-core/WCAG, responsiveness, localization, and SEO in GitHub Actions.

Link the portfolio and public test-suite repository.

## Visual Design

Preserve the current visual identity:

- Existing blue palette.
- Single-column layout.
- Current section-heading style, left-border job entries, skill tags, typography, and overall character.
- Existing contact block and portfolio link.

Make only targeted visual changes:

- Add the headline directly below the name.
- Tighten vertical spacing enough to target two A4 pages.
- Add print rules for A4 margins and `break-inside: avoid` on job/project entries.
- Ensure URLs remain visible or recoverable in exported text.
- Remove hidden joke comments and web-only hover/animation behavior where it adds no value to the printed CV.
- Keep the document readable without external Font Awesome icons; missing CDN assets must not remove contact information or headings.

## ATS and Language Rules

- Use standard section names and plain selectable text.
- Expand important keywords: `Selenium WebDriver`, `REST API Testing`, `Software Development Engineer in Test (SDET)` where natural.
- Use English month names in dates for international readability.
- Add `English — Professional working proficiency; used daily in an international environment` without inventing a CEFR level.
- Use official certification names where known; omit dates rather than guessing.
- Remove the high-school entry.
- Keep unfinished university study transparent as `Computer Science coursework — four semesters`.
- Retain a short English recruitment-consent sentence for Polish applications and remove `(GDPR compliance)`.

## Non-Goals

- No second CV variant.
- No major visual redesign.
- No invented metrics, employment dates, direct reports, publication status, or business impact.
- No claim that Piotr formally managed QA staff.
- No disclosure of private repository URLs or confidential product names.
- No automatic deployment or portfolio update as part of the initial CV rewrite.

## Acceptance Criteria

- One English hybrid CV, primarily SDET/SWE with credible QA leadership.
- Current design language remains recognizably intact.
- Professional claims match confirmed facts and local project evidence.
- The strongest metrics appear in the summary and Mobilum Pay experience.
- Software engineering projects receive enough space to prove genuine development depth.
- The HTML is valid, readable, and suitable for exporting to a selectable-text PDF.
- Print output is no more than two A4 pages without splitting individual job/project entries awkwardly.
- Text extraction preserves the intended reading order and critical contact details.
