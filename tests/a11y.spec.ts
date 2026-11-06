import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

async function findViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations;
}

type Violations = Awaited<ReturnType<typeof findViolations>>;

function formatViolations(violations: Violations): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.target.join(' ')}${node.failureSummary ? `\n    ${node.failureSummary}` : ''}`)
        .join('\n');
      return `${violation.id} [${violation.impact ?? 'unknown'}] ${violation.help}\n${nodes}`;
    })
    .join('\n\n');
}

async function expectNoViolations(page: Page, screen: string) {
  const violations = await findViolations(page);
  expect(violations, `Violazioni WCAG in ${screen}:\n${formatViolations(violations)}`).toEqual([]);
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

const MODULES = [
  { name: 'Sintassi dinamica', path: '/app/sintassi', heading: 'Sintassi dinamica' },
  { name: 'Matrix-Talk', path: '/app/matrici', heading: 'Matrix-Talk' },
  { name: 'Ritmo e sillabe', path: '/app/ritmo', heading: 'Ritmo e sillabe' },
  { name: 'Trama e nessi', path: '/app/racconto', heading: 'Trama e nessi' },
  { name: 'Social Deck', path: '/app/sociale', heading: 'Social Deck' },
  { name: 'Storie sociali', path: '/app/storie', heading: 'Storie sociali' },
] as const;

test('moduli dopo lo sblocco della cassaforte senza violazioni WCAG', async ({ page }) => {
  await page.goto('/#/app');
  await expect(page.getByRole('heading', { level: 1, name: 'Proteggi i dati della seduta' })).toBeVisible();

  const passphrase = 'ponti accessibile';
  await page.getByLabel('Passphrase', { exact: true }).fill(passphrase);
  await page.getByLabel('Ripeti la passphrase').fill(passphrase);
  await page.getByRole('button', { name: 'Crea la cassaforte' }).click();

  await expect(page.getByRole('heading', { level: 1, name: /Ciao,/ })).toBeVisible({ timeout: 20_000 });

  const results: { screen: string; violations: Violations }[] = [];
  for (const module of MODULES) {
    await page.evaluate((path) => {
      window.location.hash = path;
    }, module.path);
    await expect(page.getByRole('heading', { level: 1, name: module.heading })).toBeVisible();
    results.push({ screen: module.name, violations: await findViolations(page) });
  }

  const failures = results.filter((result) => result.violations.length > 0);
  const details = failures
    .map((result) => `Violazioni WCAG in ${result.screen}:\n${formatViolations(result.violations)}`)
    .join('\n\n');
  expect(failures, details).toEqual([]);
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
