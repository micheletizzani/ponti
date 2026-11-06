import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

async function expectNoViolations(page: Page, screen: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const details = results.violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.target.join(' ')}${node.failureSummary ? `\n    ${node.failureSummary}` : ''}`)
        .join('\n');
      return `${violation.id} [${violation.impact ?? 'unknown'}] ${violation.help}\n${nodes}`;
    })
    .join('\n\n');

  expect(results.violations, `Violazioni WCAG in ${screen}:\n${details}`).toEqual([]);
}

test('landing pubblica senza violazioni WCAG', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1, name: /Imparare insieme/ })).toBeVisible();
  await expectNoViolations(page, 'landing');
});

test('cassaforte e schermata Oggi senza violazioni WCAG', async ({ page }) => {
  await page.goto('/#/app');
  const continueWithoutSaving = page.getByRole('button', { name: 'Continua senza salvare' });
  await expect(continueWithoutSaving).toBeVisible();
  await expectNoViolations(page, 'cassaforte');

  await continueWithoutSaving.click();
  await expect(page.getByRole('heading', { level: 1, name: /Ciao,/ })).toBeVisible();
  await expectNoViolations(page, 'Oggi');
});

test('guida senza violazioni WCAG', async ({ page }) => {
  await page.goto('/#/app/guida');
  await expect(page.getByRole('heading', { name: /Accessibilità cognitiva/ })).toBeVisible();
  await expectNoViolations(page, 'guida');
});

test('impostazioni senza violazioni WCAG', async ({ page }) => {
  await page.goto('/#/');
  await page.getByRole('button', { name: 'Impostazioni di lettura' }).click();
  await expect(page.getByRole('dialog', { name: 'Come vuoi leggere' })).toBeVisible();
  await expectNoViolations(page, 'impostazioni');
});
