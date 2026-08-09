import { test, expect } from '@playwright/test';
import { TEST_LOCALE, localePath } from './utils/locale';

const OPEN_GRAPH_LOCALES: Record<string, string> = {
    en: 'en_US',
    pl: 'pl_PL',
    de: 'de_DE',
    es: 'es_ES',
    ar: 'ar_SA',
};

const HOME_TITLES: Record<string, string> = {
    en: 'Piotr Doliński | Senior Software Tester & Programmer',
    pl: 'Piotr Doliński | Senior QA Engineer & SDET',
    de: 'Piotr Doliński | Senior QA Engineer & SDET',
    es: 'Piotr Doliński | Senior QA Engineer & SDET',
    ar: 'Piotr Doliński | مهندس ضمان جودة أول | SDET',
};

const HOME_DESCRIPTIONS: Record<string, string> = {
    en: 'Piotr Doliński - Professional portfolio showcasing expertise in test automation, software testing, QA engineering, and web development.',
    pl: 'Portfolio Senior QA i SDET z automatyzacją, testami i inżynierią jakości.',
    de: 'Senior QA und SDET Portfolio mit Automatisierung, Tests und Quality Engineering.',
    es: 'Portafolio Senior QA y SDET con automatización, testing e ingeniería de calidad.',
    ar: 'محفظة Senior QA و SDET مع الأتمتة والاختبارات وهندسة الجودة.',
};

test.describe('SEO & Metadata Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(localePath());
    });

    test('renders correct canonical link and basic meta tags', async ({ page }) => {
        await expect(page).toHaveTitle(new RegExp(HOME_TITLES[TEST_LOCALE].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

        // Assert description meta
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', HOME_DESCRIPTIONS[TEST_LOCALE]);

        // Assert Canonical URL
        const canonicalTag = page.locator('link[rel="canonical"]');
        await expect(canonicalTag).toBeAttached();

        await expect(canonicalTag).toHaveAttribute('href', `https://piotrdolinski.com/${TEST_LOCALE}`);
    });


    test('renders OpenGraph tags', async ({ page }) => {
        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle).toBeAttached();

        const ogType = page.locator('meta[property="og:type"]');
        await expect(ogType).toHaveAttribute('content', 'website');

        const ogLocale = page.locator('meta[property="og:locale"]');
        await expect(ogLocale).toHaveAttribute('content', OPEN_GRAPH_LOCALES[TEST_LOCALE]);

        const ogUrl = page.locator('meta[property="og:url"]');
        await expect(ogUrl).toHaveAttribute('content', `https://piotrdolinski.com/${TEST_LOCALE}`);
    });
});
