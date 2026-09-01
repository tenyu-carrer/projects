import { test, expect } from '@playwright/test';

test.describe('Counter App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('初期表示でカウントが0であること', async ({ page }) => {
    await expect(page.getByTestId('count')).toHaveText('0');
  });

  test('+1ボタンを押すとカウントが増えること', async ({ page }) => {
    const increment = page.getByTestId('increment');
    await increment.click();
    await increment.click();
    await increment.click();
    await expect(page.getByTestId('count')).toHaveText('3');
  });

  test('Resetボタンを押すとカウントが0に戻ること', async ({ page }) => {
    const increment = page.getByTestId('increment');
    const reset = page.getByTestId('reset');
    await increment.click();
    await increment.click();
    await reset.click();
    await expect(page.getByTestId('count')).toHaveText('0');
  });
});
