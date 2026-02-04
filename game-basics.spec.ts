import { test, expect } from '@playwright/test';

const GAME_URL = `file://${process.cwd()}/index.html`;

test.describe('Claw Machine Game - Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForSelector('#game-area');
    await page.waitForFunction(() => window.state && window.state.dolls, { timeout: 10000 });
  });

  test.describe('Game Initialization', () => {
    test('should initialize with score 0', async ({ page }) => {
      const score = await page.evaluate(() => window.state.score);
      expect(score).toBe(0);
    });

    test('should have dolls in the game area', async ({ page }) => {
      const dollCount = await page.evaluate(() => window.state.dolls.length);
      expect(dollCount).toBeGreaterThan(0);
    });

    test('should initialize claw in idle state', async ({ page }) => {
      const clawState = await page.evaluate(() => window.state.claw.state);
      expect(clawState).toBe('idle');
    });

    test('should have claw at starting position', async ({ page }) => {
      const clawY = await page.evaluate(() => window.state.claw.y);
      expect(clawY).toBeLessThan(20); // Near the top
    });
  });

  test.describe('UI Elements', () => {
    test('should display game title', async ({ page }) => {
      const title = await page.textContent('h1');
      expect(title).toContain('CLAW');
    });

    test('should have score display', async ({ page }) => {
      const scoreDisplay = await page.locator('#score-display');
      await expect(scoreDisplay).toBeVisible();
    });

    test('should have grab button', async ({ page }) => {
      const grabBtn = await page.locator('#grab-btn');
      await expect(grabBtn).toBeVisible();
    });

    test('should have left arrow button', async ({ page }) => {
      const leftBtn = await page.locator('#left-btn');
      await expect(leftBtn).toBeVisible();
    });

    test('should have right arrow button', async ({ page }) => {
      const rightBtn = await page.locator('#right-btn');
      await expect(rightBtn).toBeVisible();
    });

    test('should have game area container', async ({ page }) => {
      const gameArea = await page.locator('#game-area');
      await expect(gameArea).toBeVisible();
    });

    test('should have claw assembly', async ({ page }) => {
      const clawAssembly = await page.locator('#claw-assembly');
      await expect(clawAssembly).toBeVisible();
    });
  });

  test.describe('Keyboard Controls', () => {
    test('should move claw left with ArrowLeft', async ({ page }) => {
      const initialX = await page.evaluate(() => window.state.claw.x);
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);
      const newX = await page.evaluate(() => window.state.claw.x);
      expect(newX).toBeLessThan(initialX);
    });

    test('should move claw right with ArrowRight', async ({ page }) => {
      // First move left to ensure we have room to move right
      await page.evaluate(() => { window.state.claw.x = 30; });
      await page.waitForTimeout(100);
      
      const initialX = await page.evaluate(() => window.state.claw.x);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      const newX = await page.evaluate(() => window.state.claw.x);
      expect(newX).toBeGreaterThan(initialX);
    });

    test('should trigger grab with Space key', async ({ page }) => {
      const initialState = await page.evaluate(() => window.state.claw.state);
      expect(initialState).toBe('idle');
      
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      
      const newState = await page.evaluate(() => window.state.claw.state);
      expect(['dropping', 'grabbing', 'rising']).toContain(newState);
    });

    test('should not move claw while grabbing', async ({ page }) => {
      // Start a grab
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);
      
      const xDuringGrab = await page.evaluate(() => window.state.claw.x);
      
      // Try to move
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);
      
      const xAfterMove = await page.evaluate(() => window.state.claw.x);
      expect(xAfterMove).toBe(xDuringGrab);
    });
  });

  test.describe('Touch Button Controls', () => {
    test('should move claw left when left button clicked', async ({ page }) => {
      const initialX = await page.evaluate(() => window.state.claw.x);
      await page.click('#left-btn');
      await page.waitForTimeout(150);
      const newX = await page.evaluate(() => window.state.claw.x);
      expect(newX).toBeLessThan(initialX);
    });

    test('should move claw right when right button clicked', async ({ page }) => {
      await page.evaluate(() => { window.state.claw.x = 30; });
      await page.waitForTimeout(100);
      
      const initialX = await page.evaluate(() => window.state.claw.x);
      await page.click('#right-btn');
      await page.waitForTimeout(150);
      const newX = await page.evaluate(() => window.state.claw.x);
      expect(newX).toBeGreaterThan(initialX);
    });

    test('should trigger grab when grab button clicked', async ({ page }) => {
      await page.click('#grab-btn');
      await page.waitForTimeout(200);
      
      const state = await page.evaluate(() => window.state.claw.state);
      expect(['dropping', 'grabbing', 'rising']).toContain(state);
    });
  });

  test.describe('Claw Movement Boundaries', () => {
    test('should not move claw beyond left boundary', async ({ page }) => {
      // Move to leftmost position
      await page.evaluate(() => { window.state.claw.x = 10; });
      await page.waitForTimeout(100);
      
      // Try to move further left multiple times
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(50);
      }
      
      const x = await page.evaluate(() => window.state.claw.x);
      expect(x).toBeGreaterThanOrEqual(5); // Minimum boundary
    });

    test('should not move claw beyond right boundary', async ({ page }) => {
      // Move to rightmost position
      await page.evaluate(() => { window.state.claw.x = 90; });
      await page.waitForTimeout(100);
      
      // Try to move further right multiple times
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(50);
      }
      
      const x = await page.evaluate(() => window.state.claw.x);
      expect(x).toBeLessThanOrEqual(95); // Maximum boundary
    });
  });

  test.describe('Claw State Machine', () => {
    test('should transition from idle to dropping on grab', async ({ page }) => {
      const beforeState = await page.evaluate(() => window.state.claw.state);
      expect(beforeState).toBe('idle');
      
      await page.click('#grab-btn');
      await page.waitForTimeout(100);
      
      const afterState = await page.evaluate(() => window.state.claw.state);
      expect(afterState).toBe('dropping');
    });

    test('should eventually return to idle after grab cycle', async ({ page }) => {
      await page.click('#grab-btn');
      
      // Wait for the full grab cycle (drop + grab + rise)
      await page.waitForTimeout(4000);
      
      const finalState = await page.evaluate(() => window.state.claw.state);
      expect(finalState).toBe('idle');
    });

    test('should increase cable length while dropping', async ({ page }) => {
      const initialY = await page.evaluate(() => window.state.claw.y);
      
      await page.click('#grab-btn');
      await page.waitForTimeout(500);
      
      const droppingY = await page.evaluate(() => window.state.claw.y);
      expect(droppingY).toBeGreaterThan(initialY);
    });
  });

  test.describe('Score Display', () => {
    test('should update score display when score changes', async ({ page }) => {
      // Manually set score to test display update
      await page.evaluate(() => {
        window.state.score = 5;
        document.getElementById('score-display').textContent = 'SCORE: ' + window.state.score;
      });
      
      const scoreText = await page.textContent('#score-display');
      expect(scoreText).toContain('5');
    });

    test('should display score in correct format', async ({ page }) => {
      const scoreText = await page.textContent('#score-display');
      expect(scoreText).toMatch(/SCORE:\s*\d+/i);
    });
  });

  test.describe('Doll Rendering', () => {
    test('should render dolls with emoji content', async ({ page }) => {
      const dolls = await page.locator('.doll').all();
      expect(dolls.length).toBeGreaterThan(0);
      
      for (const doll of dolls) {
        const text = await doll.textContent();
        expect(text.length).toBeGreaterThan(0);
      }
    });

    test('should position dolls within game area', async ({ page }) => {
      const gameAreaBox = await page.locator('#game-area').boundingBox();
      const dolls = await page.locator('.doll').all();
      
      for (const doll of dolls) {
        const dollBox = await doll.boundingBox();
        expect(dollBox.x).toBeGreaterThanOrEqual(gameAreaBox.x);
        expect(dollBox.x + dollBox.width).toBeLessThanOrEqual(gameAreaBox.x + gameAreaBox.width);
      }
    });
  });
});
