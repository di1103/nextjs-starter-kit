import { test, expect } from '@playwright/test';

test('ホームページが表示される', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/./);
});

test('モバイルでタップ可能なサイズ', async ({ page }) => {
  await page.goto('/');

  const buttons = page.locator('button');
  const count = await buttons.count();

  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const box = await button.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});
