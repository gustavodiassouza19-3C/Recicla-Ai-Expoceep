import { test, expect } from '@playwright/test';

test.describe('Dashboard Visual Validation', () => {
  test('Desktop screenshot - Dashboard overview', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-desktop.png', 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Mobile screenshot - Dashboard overview', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-mobile.png', 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Desktop screenshot - Modal open', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.click('button:has-text("Associar Novo Lacre")');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-modal-open.png', 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Dark mode - Desktop', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-desktop-dark.png', 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Dark mode - Mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-mobile-dark.png', 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Hover states on metric cards', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const firstCard = page.locator('[class*="group"]').first();
    await firstCard.hover();
    await page.waitForTimeout(300);
    
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-hover-metric.png', 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Table row hover', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const firstRow = page.locator('[class*="divide-y"] > div').first();
    await firstRow.hover();
    await page.waitForTimeout(300);
    
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-hover-row.png', 
      fullPage: true,
      animations: 'disabled'
    });
  });
});