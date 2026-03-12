/**
 * DOM Test Runner
 *
 * Runs DOM tests defined in JSON format against a Puppeteer page.
 *
 * Supported test types:
 *   - "exists"       → checks if element matching selector exists
 *   - "notExists"    → checks if element does NOT exist
 *   - "textContains" → checks if element's text content contains expected value
 *   - "textEquals"   → checks if element's text content equals expected value
 *   - "hasAttribute" → checks if element has a specific attribute
 *   - "attrEquals"   → checks if element's attribute equals expected value
 *   - "hasClass"     → checks if element has a specific CSS class
 *   - "childCount"   → checks if element has expected number of children
 *   - "tagName"      → checks if element has expected tag name
 *   - "isVisible"    → checks if element is visible on page
 *
 * Test format:
 * {
 *   "selector": "#addBtn",
 *   "type": "exists",
 *   "expected": "optional value depending on type",
 *   "description": "Optional human-readable description"
 * }
 */

/**
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {Array} domTests - Array of DOM test objects
 * @returns {Array} Array of test results with { test, passed, actual, error }
 */
async function runDomTests(page, domTests) {
  const results = [];

  for (const test of domTests) {
    const result = {
      test: {
        selector: test.selector,
        type: test.type,
        expected: test.expected || null,
        description: test.description || `${test.type}: ${test.selector}`,
      },
      passed: false,
      actual: null,
      error: null,
    };

    try {
      switch (test.type) {
        // ── EXISTS ─────────────────────────────────────────────────
        case "exists": {
          const element = await page.$(test.selector);
          result.passed = element !== null;
          result.actual = element !== null ? "Element found" : "Element not found";
          break;
        }

        // ── NOT EXISTS ─────────────────────────────────────────────
        case "notExists": {
          const element = await page.$(test.selector);
          result.passed = element === null;
          result.actual = element === null ? "Element not found" : "Element found";
          break;
        }

        // ── TEXT CONTAINS ──────────────────────────────────────────
        case "textContains": {
          const text = await page.$eval(test.selector, (el) => el.textContent.trim());
          result.passed = text.includes(test.expected);
          result.actual = text;
          break;
        }

        // ── TEXT EQUALS ────────────────────────────────────────────
        case "textEquals": {
          const text = await page.$eval(test.selector, (el) => el.textContent.trim());
          result.passed = text === test.expected;
          result.actual = text;
          break;
        }

        // ── HAS ATTRIBUTE ──────────────────────────────────────────
        case "hasAttribute": {
          const hasAttr = await page.$eval(
            test.selector,
            (el, attr) => el.hasAttribute(attr),
            test.expected
          );
          result.passed = hasAttr;
          result.actual = hasAttr ? "Attribute present" : "Attribute missing";
          break;
        }

        // ── ATTRIBUTE EQUALS ───────────────────────────────────────
        case "attrEquals": {
          const attrValue = await page.$eval(
            test.selector,
            (el, attr) => el.getAttribute(attr),
            test.attribute || test.expected
          );
          result.passed = attrValue === test.expectedValue;
          result.actual = attrValue;
          break;
        }

        // ── HAS CLASS ──────────────────────────────────────────────
        case "hasClass": {
          const hasClass = await page.$eval(
            test.selector,
            (el, cls) => el.classList.contains(cls),
            test.expected
          );
          result.passed = hasClass;
          result.actual = hasClass ? "Class present" : "Class missing";
          break;
        }

        // ── CHILD COUNT ────────────────────────────────────────────
        case "childCount": {
          const count = await page.$eval(
            test.selector,
            (el) => el.children.length
          );
          result.passed = count === parseInt(test.expected);
          result.actual = count;
          break;
        }

        // ── TAG NAME ───────────────────────────────────────────────
        case "tagName": {
          const tagName = await page.$eval(
            test.selector,
            (el) => el.tagName.toLowerCase()
          );
          result.passed = tagName === test.expected.toLowerCase();
          result.actual = tagName;
          break;
        }

        // ── IS VISIBLE ─────────────────────────────────────────────
        case "isVisible": {
          const isVisible = await page.$eval(test.selector, (el) => {
            const style = window.getComputedStyle(el);
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0" &&
              el.offsetWidth > 0 &&
              el.offsetHeight > 0
            );
          });
          result.passed = isVisible;
          result.actual = isVisible ? "Visible" : "Not visible";
          break;
        }

        default:
          result.error = `Unknown test type: ${test.type}`;
          result.actual = "Skipped";
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

module.exports = { runDomTests };
