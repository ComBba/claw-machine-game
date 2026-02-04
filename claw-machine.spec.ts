import { test, expect } from '@playwright/test';

const GAME_URL = `file://${process.cwd()}/index.html`;

async function getDollPositions(page) {
  return await page.evaluate(() => {
    const dolls = document.querySelectorAll('.doll');
    const gameArea = document.getElementById('game-area').getBoundingClientRect();
    return Array.from(dolls).map(doll => {
      const rect = doll.getBoundingClientRect();
      return {
        id: doll.dataset.dollId,
        emoji: doll.textContent,
        centerX: rect.left + rect.width / 2 - gameArea.left,
        centerY: rect.top + rect.height / 2 - gameArea.top,
        left: rect.left - gameArea.left,
        top: rect.top - gameArea.top
      };
    });
  });
}

async function getClawPosition(page) {
  return await page.evaluate(() => {
    const clawAssembly = document.getElementById('claw-assembly');
    const gameArea = document.getElementById('game-area').getBoundingClientRect();
    const rect = clawAssembly.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - gameArea.left,
      y: rect.top + rect.height / 2 - gameArea.top,
      state: window.state.claw.state,
      cableLength: window.state.claw.y
    };
  });
}

async function moveClawToPosition(page, targetXPercent) {
  await page.evaluate((x) => {
    window.state.claw.x = x;
  }, targetXPercent);
  await page.waitForTimeout(200);
}

async function performGrab(page) {
  const initialScore = await page.evaluate(() => window.state.score);
  const clawBefore = await getClawPosition(page);
  console.log(`  Before grab: state=${clawBefore.state}, score=${initialScore}, cable=${clawBefore.cableLength}`);
  
  await page.click('#grab-btn');
  await page.waitForTimeout(500);
  
  const clawDropping = await getClawPosition(page);
  console.log(`  After click: state=${clawDropping.state}, cable=${clawDropping.cableLength}`);
  
  await page.waitForTimeout(2000);
  
  const clawAfter = await getClawPosition(page);
  const newScore = await page.evaluate(() => window.state.score);
  console.log(`  After wait: state=${clawAfter.state}, score=${newScore}, cable=${clawAfter.cableLength}`);
  
  return newScore > initialScore;
}

test.describe('Claw Machine Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForSelector('#game-area');
    await page.waitForFunction(() => window.state && window.state.dolls, { timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('should catch 3 dolls successfully', async ({ page }) => {
    test.setTimeout(180000);
    
    const caughtDolls = [];
    let attempts = 0;
    const maxAttempts = 20;
    
    while (caughtDolls.length < 3 && attempts < maxAttempts) {
      attempts++;
      
      const dolls = await getDollPositions(page);
      console.log(`\n=== Attempt ${attempts} ===`);
      console.log(`Available dolls: ${dolls.length}`);
      
      if (dolls.length === 0) {
        console.log('No dolls available, waiting...');
        await page.waitForTimeout(2000);
        continue;
      }
      
      const targetDoll = dolls[Math.floor(Math.random() * dolls.length)];
      
      console.log(`Targeting doll: ${targetDoll.emoji} at (${targetDoll.centerX.toFixed(1)}, ${targetDoll.centerY.toFixed(1)})`);
      
      const gameArea = await page.evaluate(() => {
        const area = document.getElementById('game-area');
        return { width: area.clientWidth, height: area.clientHeight };
      });
      
      const targetX = (targetDoll.centerX / gameArea.width) * 100;
      console.log(`Moving claw to X:${targetX.toFixed(1)}%`);
      
      await moveClawToPosition(page, targetX);
      
      const clawPos = await getClawPosition(page);
      console.log(`Claw position: (${clawPos.x.toFixed(1)}, ${clawPos.y.toFixed(1)}), state=${clawPos.state}`);
      
      await page.waitForTimeout(500);
      
      const success = await performGrab(page);
      
      if (success) {
        caughtDolls.push(targetDoll.emoji);
        console.log(`SUCCESS! Caught ${targetDoll.emoji} (${caughtDolls.length}/3)`);
      } else {
        console.log(`FAILED to catch ${targetDoll.emoji}`);
      }
      
      await page.waitForTimeout(1500);
    }
    
    console.log(`\n=== FINAL RESULTS ===`);
    console.log(`Caught ${caughtDolls.length} unique dolls: ${caughtDolls.join(', ')}`);
    console.log(`Attempts: ${attempts}`);
    
    expect(caughtDolls.length).toBeGreaterThanOrEqual(3);
    console.log('\n🎉 3 dolls caught successfully!');
  });
});
