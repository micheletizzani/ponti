import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Flusso principale casa-scuola, da capo a fondo:
 * la scuola scrive una nota, la bambina la racconta a casa, gli adulti
 * osservano un obiettivo e la nota sopravvive al cambio di passphrase.
 */

const PASSPHRASE = 'gatto blu sul tetto';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

async function createVault(page: Page, passphrase = PASSPHRASE) {
  await page.goto('/#/app');
  await page.getByLabel('Passphrase', { exact: true }).fill(passphrase);
  await page.getByLabel('Ripeti la passphrase').fill(passphrase);
  await page.getByRole('button', { name: 'Crea la cassaforte' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Ciao/ })).toBeVisible({ timeout: 20_000 });
}

async function go(page: Page, path: string) {
  await page.evaluate((target) => {
    window.location.hash = target;
  }, path);
}

async function noViolations(page: Page, screen: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations.map((violation) => `${screen}: ${violation.id}`)).toEqual([]);
}

test('dalla nota della scuola al racconto a casa', async ({ page }) => {
  test.setTimeout(90_000);
  await createVault(page);

  // Profilo: la bambina si chiama Giulia.
  await go(page, '/app/famiglia');
  await expect(page.getByRole('heading', { level: 1, name: 'Spazio famiglia' })).toBeVisible();
  await page.getByLabel('Nome', { exact: true }).fill('Giulia');
  await page.getByRole('button', { name: 'Salva il nome' }).click();
  await page.getByRole('button', { name: 'Una bambina' }).click();
  await expect(page.getByRole('button', { name: 'Passa a Giulia' })).toBeVisible();

  // La maestra scrive la nota di oggi con due momenti.
  await go(page, '/app/scuola/diario');
  await page.getByRole('button', { name: 'Scrivi la nota di oggi' }).click();
  await page.getByRole('button', { name: /Giornata serena/ }).click();
  await page.getByRole('button', { name: 'Ho cantato e suonato' }).click();
  await page.getByRole('button', { name: 'Sono andata in logopedia' }).click();
  await expect(page.getByText('Prima ho cantato e suonato. Poi sono andata in logopedia.')).toBeVisible();
  await page.getByLabel('Una cosa bella').fill('Ha passato la palla a Marco.');
  await page.getByRole('button', { name: 'Ha chiesto una pausa da sola' }).click();
  await page.getByLabel('Chi scrive (facoltativo)').fill('Maestra Anna');
  await noViolations(page, 'modulo del diario');
  await page.getByRole('button', { name: 'Salva la nota' }).click();
  await expect(page.getByText('Nota di oggi salvata e cifrata.')).toBeVisible();
  await expect(page.getByText('Da scuola · Maestra Anna')).toBeVisible();

  // Il tablet passa alla bambina: l'area adulti si chiude.
  await page.getByRole('button', { name: 'Passa a Giulia' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Ciao, Giulia!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Passa a Giulia' })).toHaveCount(0);

  // A casa: il racconto con PRIMA e POI.
  await page.getByRole('link', { name: /Racconta la giornata/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /oggi a scuola/i })).toBeVisible();
  await expect(page.getByText('Prima', { exact: true })).toBeVisible();
  await expect(page.getByText('Poi', { exact: true })).toBeVisible();
  await expect(page.getByText('Una cosa bella da chiedere:')).toBeVisible();
  await noViolations(page, 'racconto');

  // Il Social Deck propone la novità al posto della domanda già nota.
  await go(page, '/app/sociale');
  await page.getByRole('button', { name: /Una novità di oggi/ }).click();
  await expect(page.getByText(/Sai cosa ho fatto oggi\? Ho cantato e suonato!/)).toBeVisible();

  // Lo spazio scuola ora chiede la passphrase.
  await go(page, '/app/scuola');
  await expect(page.getByRole('button', { name: 'Entra' })).toBeVisible();
  await page.getByLabel('Passphrase', { exact: true }).fill('sbagliata del tutto');
  await page.getByRole('button', { name: 'Entra' }).click();
  await expect(page.getByRole('alert')).toContainText('Passphrase non corretta');
  await page.getByLabel('Passphrase', { exact: true }).fill(PASSPHRASE);
  await page.getByRole('button', { name: 'Entra' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Spazio scuola' })).toBeVisible();

  // Obiettivo dalla libreria e prima osservazione.
  await go(page, '/app/scuola/obiettivi');
  await page.getByRole('button', { name: 'Aggiungi un obiettivo' }).click();
  const preset = page.locator('li').filter({ hasText: 'Capisce chi fa l’azione anche quando la frase è al passivo' });
  await preset.getByRole('button', { name: 'Aggiungi questo' }).click();
  await expect(page.getByText('Obiettivo aggiunto.')).toBeVisible();
  await page.getByRole('button', { name: 'Aggiungi un’osservazione' }).click();
  await page.getByRole('button', { name: '2. Con domande' }).click();
  await page.getByRole('button', { name: 'Salva l’osservazione' }).click();
  await expect(page.getByText('Ultime 1 osservazioni')).toBeVisible();
  await expect(page.getByLabel('Osservazioni più recenti')).toContainText('con domande');
  await noViolations(page, 'obiettivi con osservazione');

  // L'obiettivo guida le attività suggerite in Oggi.
  await go(page, '/app');
  await expect(page.getByText('La prima viene dagli obiettivi di famiglia e scuola.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Sintassi dinamica/ })).toBeVisible();

  // Agenda: «Prima e poi», poi un passo fatto.
  await go(page, '/app/scuola/agende');
  const morning = page.locator('article').filter({ hasText: 'Mattina a scuola' });
  await morning.getByRole('button', { name: 'Usa oggi' }).click();
  await go(page, '/app/agenda');
  await expect(page.getByText('PRIMA', { exact: true })).toBeVisible();
  await expect(page.getByText('Arrivo e appendo lo zaino')).toBeVisible();
  await page.getByRole('button', { name: 'Fatto' }).click();
  await expect(page.getByText('Cerchio del mattino').first()).toBeVisible();
  await expect(page.getByText('Passi fatti: 1 di 8.', { exact: false })).toBeVisible();
  await noViolations(page, 'agenda');

  // Regressione: il cambio di passphrase deve conservare il diario.
  await go(page, '/app/progressi');
  await page.locator('summary', { hasText: 'Cambia la passphrase' }).click();
  await page.getByLabel('Passphrase attuale').fill(PASSPHRASE);
  await page.getByLabel('Nuova passphrase', { exact: true }).fill('cane rosso nel prato');
  await page.getByLabel('Ripeti la nuova passphrase').fill('cane rosso nel prato');
  await page.getByRole('button', { name: 'Cambia la passphrase' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Passphrase cambiata' })).toContainText('note dell’area adulti', {
    timeout: 20_000,
  });
  await go(page, '/app/famiglia/diario');
  await expect(page.getByText('Da scuola · Maestra Anna')).toBeVisible();
});

test('scambio cifrato tra due dispositivi', async ({ browser }, testInfo) => {
  test.setTimeout(120_000);
  const school = await browser.newPage();
  await createVault(school, 'passphrase della scuola');
  await go(school, '/app/scuola/diario');
  await school.getByRole('button', { name: 'Scrivi la nota di oggi' }).click();
  await school.getByRole('button', { name: 'Ho giocato in giardino' }).click();
  await school.getByRole('button', { name: 'Salva la nota' }).click();
  await expect(school.getByText(/salvata e cifrata/)).toBeVisible();

  await go(school, '/app/scuola/scambio');
  await school.getByLabel('Scegli una parola di scambio').fill('corto');
  await school.getByRole('button', { name: 'Crea il file cifrato' }).click();
  await expect(school.getByRole('alert')).toContainText('almeno 8 caratteri');
  await school.getByLabel('Scegli una parola di scambio').fill('arcobaleno verde');
  const downloadPromise = school.waitForEvent('download');
  await school.getByRole('button', { name: 'Crea il file cifrato' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^ponti-scambio-scuola-.*\.ponti$/);
  const filePath = testInfo.outputPath('scambio.ponti');
  await download.saveAs(filePath);
  await school.close();

  // Un altro dispositivo: contesto nuovo, cassaforte diversa.
  const context = await browser.newContext();
  const home = await context.newPage();
  await createVault(home, 'passphrase di casa');
  await go(home, '/app/famiglia/scambio');
  await home.getByLabel('File ricevuto (.ponti)').setInputFiles(filePath);
  await home.getByLabel('La parola di scambio che vi siete detti').fill('parola sbagliata');
  await home.getByRole('button', { name: 'Apri e aggiungi' }).click();
  await expect(home.getByRole('alert')).toContainText('non è quella giusta');
  await home.getByLabel('La parola di scambio che vi siete detti').fill('arcobaleno verde');
  await home.getByRole('button', { name: 'Apri e aggiungi' }).click();
  await expect(home.getByRole('status')).toContainText('Ricevuto dalla scuola: 1 note nuove');

  // Importare due volte lo stesso file non duplica nulla.
  await home.getByLabel('File ricevuto (.ponti)').setInputFiles(filePath);
  await home.getByLabel('La parola di scambio che vi siete detti').fill('arcobaleno verde');
  await home.getByRole('button', { name: 'Apri e aggiungi' }).click();
  await expect(home.getByRole('status')).toContainText('0 note nuove');

  await go(home, '/app/racconta');
  await expect(home.getByText('Ho giocato in giardino')).toBeVisible();
  await context.close();
});
