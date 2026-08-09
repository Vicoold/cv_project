import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Places an off-screen control fully in the viewport before exercising its real
 * pointer interaction. An instant setup scroll avoids CSS smooth scrolling
 * moving the target between pointerdown and pointerup in some browser engines.
 */
export async function clickInViewport(locator: Locator) {
  await locator.evaluate((element) => {
    const root = document.documentElement;
    const previousBehavior = root.style.getPropertyValue('scroll-behavior');
    const previousPriority = root.style.getPropertyPriority('scroll-behavior');

    root.style.setProperty('scroll-behavior', 'auto', 'important');
    try {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      });
    } finally {
      if (previousBehavior) {
        root.style.setProperty('scroll-behavior', previousBehavior, previousPriority);
      } else {
        root.style.removeProperty('scroll-behavior');
      }
    }
  });
  await expect(locator).toBeInViewport({ ratio: 1 });
  await locator.click();
}

export async function openMobileMenuIfNeeded(page: Page, isMobile: boolean) {
  if (!isMobile) {
    return;
  }

  const mobileMenuToggle = page.getByTestId('mobile-menu-toggle');
  await expect(mobileMenuToggle).toBeVisible();
  await expect(mobileMenuToggle).toHaveAccessibleName(/\S/);
  await mobileMenuToggle.click();
}
