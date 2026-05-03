import { test, expect } from '@playwright/test';

test.describe('Smoke: critical path', () => {
    test('landing page loads', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/DateApp|Вход|Login/i);
    });

    test('auth flow exists', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('protected routes redirect to login', async ({ page }) => {
        await page.goto('/dates');
        await page.waitForURL(/\/login/);
        expect(page.url()).toContain('/login');
    });
});