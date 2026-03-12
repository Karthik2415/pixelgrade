/**
 * Interaction Test Runner
 *
 * Runs interaction-based tests using Puppeteer to simulate user actions.
 *
 * Supported action types:
 *   - "type"     → type text into an input field
 *   - "click"    → click an element
 *   - "select"   → select an option from a <select> element
 *   - "focus"    → focus an element
 *   - "hover"    → hover over an element
 *   - "keypress" → press a keyboard key
 *   - "clear"    → clear an input field
 *   - "wait"     → wait for a specified duration (ms)
 *
 * Supported verify types (after actions):
 *   - "exists"       → element exists after actions
 *   - "notExists"    → element should not exist after actions
 *   - "textContains" → element text contains expected value
 *   - "textEquals"   → element text equals expected value
 *   - "valueEquals"  → input value equals expected value
 *   - "hasClass"     → element has expected CSS class
 *   - "isVisible"    → element is visible
 *   - "isHidden"     → element is hidden
 *   - "countEquals"  → number of elements matching selector equals expected
 *
 * Test format:
 * {
 *   "description": "Click add button and verify item appears",
 *   "actions": [
 *     { "type": "type", "selector": "#input", "value": "Hello" },
 *     { "type": "click", "selector": "#addBtn" }
 *   ],
 *   "verify": {
 *     "selector": "#list li",
 *     "type": "countEquals",
 *     "expected": "1"
 *   }
 * }
 */

/**
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {Array} interactionTests - Array of interaction test objects
 * @returns {Array} Array of results with { test, passed, actual, error }
 */
async function runInteractionTests(page, interactionTests) {
  const results = [];

  for (const test of interactionTests) {
    const result = {
      test: {
        description: test.description || "Interaction test",
        actions: test.actions || [],
        verify: test.verify || null,
      },
      passed: false,
      actual: null,
      error: null,
    };

    try {
      // ── Execute actions sequentially ─────────────────────────────
      for (const action of test.actions || []) {
        await executeAction(page, action);
      }

      // Small delay for DOM updates / animations
      await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));

      // ── Verify result ────────────────────────────────────────────
      if (test.verify) {
        const verifyResult = await verifyCondition(page, test.verify);
        result.passed = verifyResult.passed;
        result.actual = verifyResult.actual;
      } else {
        // If no verify step, the test passes if actions complete without error
        result.passed = true;
        result.actual = "All actions completed successfully";
      }
    } catch (error) {
      result.passed = false;
      result.error = error.message;
      result.actual = `Error: ${error.message}`;
    }

    results.push(result);
  }

  return results;
}

/**
 * Execute a single user action on the page
 */
async function executeAction(page, action) {
  const { type, selector, value } = action;

  switch (type) {
    case "type":
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.type(selector, value || "");
      break;

    case "click":
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);
      break;

    case "select":
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.select(selector, value || "");
      break;

    case "focus":
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.focus(selector);
      break;

    case "hover":
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.hover(selector);
      break;

    case "keypress":
      await page.keyboard.press(value || "Enter");
      break;

    case "clear":
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector, { clickCount: 3 });
      await page.keyboard.press("Backspace");
      break;

    case "wait":
      await page.evaluate(
        (ms) => new Promise((r) => setTimeout(r, ms)),
        parseInt(value) || 500
      );
      break;

    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

/**
 * Verify a condition on the page after actions
 */
async function verifyCondition(page, verify) {
  const { selector, type, expected } = verify;

  switch (type) {
    // ── EXISTS ───────────────────────────────────────────────────────
    case "exists": {
      const el = await page.$(selector);
      return {
        passed: el !== null,
        actual: el !== null ? "Element found" : "Element not found",
      };
    }

    // ── NOT EXISTS ───────────────────────────────────────────────────
    case "notExists": {
      const el = await page.$(selector);
      return {
        passed: el === null,
        actual: el === null ? "Element not found" : "Element exists",
      };
    }

    // ── TEXT CONTAINS ────────────────────────────────────────────────
    case "textContains": {
      const text = await page.$eval(selector, (el) => el.textContent.trim());
      return {
        passed: text.includes(expected),
        actual: text,
      };
    }

    // ── TEXT EQUALS ──────────────────────────────────────────────────
    case "textEquals": {
      const text = await page.$eval(selector, (el) => el.textContent.trim());
      return {
        passed: text === expected,
        actual: text,
      };
    }

    // ── VALUE EQUALS ─────────────────────────────────────────────────
    case "valueEquals": {
      const value = await page.$eval(selector, (el) => el.value);
      return {
        passed: value === expected,
        actual: value,
      };
    }

    // ── HAS CLASS ────────────────────────────────────────────────────
    case "hasClass": {
      const hasClass = await page.$eval(
        selector,
        (el, cls) => el.classList.contains(cls),
        expected
      );
      return {
        passed: hasClass,
        actual: hasClass ? "Class present" : "Class missing",
      };
    }

    // ── IS VISIBLE ───────────────────────────────────────────────────
    case "isVisible": {
      const isVisible = await page.$eval(selector, (el) => {
        const style = window.getComputedStyle(el);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        );
      });
      return {
        passed: isVisible,
        actual: isVisible ? "Visible" : "Not visible",
      };
    }

    // ── IS HIDDEN ────────────────────────────────────────────────────
    case "isHidden": {
      const isHidden = await page.$eval(selector, (el) => {
        const style = window.getComputedStyle(el);
        return (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        );
      });
      return {
        passed: isHidden,
        actual: isHidden ? "Hidden" : "Not hidden",
      };
    }

    // ── COUNT EQUALS ─────────────────────────────────────────────────
    case "countEquals": {
      const elements = await page.$$(selector);
      const count = elements.length;
      return {
        passed: count === parseInt(expected),
        actual: count,
      };
    }

    default:
      return {
        passed: false,
        actual: `Unknown verify type: ${type}`,
      };
  }
}

module.exports = { runInteractionTests };
