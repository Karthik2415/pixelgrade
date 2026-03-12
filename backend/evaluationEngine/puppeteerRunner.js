const puppeteer = require("puppeteer");
const { runDomTests } = require("./domTestRunner");
const { runInteractionTests } = require("./interactionTestRunner");
const { normalizeTestCases } = require("./testNormalizer");

/**
 * Runs the full Puppeteer-based evaluation pipeline:
 *   1. Launches Chromium
 *   2. Renders student HTML with injected CSS & JS
 *   3. Runs DOM tests
 *   4. Runs interaction tests
 *   5. Captures screenshot
 *
 * @param {Object} options
 * @param {string} options.htmlCode  - Student's HTML code
 * @param {string} options.cssCode   - Student's CSS code
 * @param {string} options.jsCode    - Student's JS code
 * @param {Object} options.testCases - { domTests: [], interactionTests: [] }
 * @param {string} options.screenshotPath - Path to save the actual screenshot
 * @returns {Object} { domTestResults, interactionTestResults, screenshotPath }
 */
async function runPuppeteerEvaluation({
  htmlCode,
  cssCode,
  jsCode,
  testCases,
  screenshotPath,
}) {
  let browser = null;

  try {
    // ── 1. Launch Chromium ──────────────────────────────────────────
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1280, height: 720 });

    // ── 2. Build full HTML with injected CSS & JS ──────────────────
    const fullHtml = buildFullHtml(htmlCode, cssCode, jsCode);

    // Load the content
    await page.setContent(fullHtml, {
      waitUntil: "networkidle0",
      timeout: 10000,
    });

    // Wait a moment for any animations/rendering to complete
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

    // ── 2.5. Normalize test cases ──────────────────────────────────
    const normalized = normalizeTestCases(testCases);
    console.log(`📋 Normalized DOM tests: ${normalized.domTests.length}, Interaction tests: ${normalized.interactionTests.length}`);

    // ── 3. Run DOM tests ───────────────────────────────────────────
    const domTestResults = await runDomTests(page, normalized.domTests);

    // ── 4. Run interaction tests ───────────────────────────────────
    const interactionTestResults = await runInteractionTests(
      page,
      normalized.interactionTests
    );

    // ── 5. Capture screenshot ──────────────────────────────────────
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      type: "png",
    });

    return {
      domTestResults,
      interactionTestResults,
      screenshotPath,
    };
  } catch (error) {
    console.error("Puppeteer evaluation error:", error);
    throw new Error(`Puppeteer evaluation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Constructs a full HTML document with injected CSS and JS.
 * If the student HTML already has <html>/<head>/<body> tags, we inject into those.
 * Otherwise, we wrap everything in a clean document.
 */
function buildFullHtml(htmlCode, cssCode, jsCode) {
  const hasHtmlTag = /<html[\s>]/i.test(htmlCode);
  const hasHeadTag = /<head[\s>]/i.test(htmlCode);
  const hasBodyTag = /<body[\s>]/i.test(htmlCode);

  if (hasHtmlTag && hasBodyTag) {
    // Inject CSS into <head> and JS before </body>
    let result = htmlCode;

    // Inject CSS
    if (cssCode) {
      const styleTag = `<style>\n${cssCode}\n</style>`;
      if (hasHeadTag) {
        result = result.replace(/<\/head>/i, `${styleTag}\n</head>`);
      } else {
        result = result.replace(/<html[^>]*>/i, `$&\n<head>${styleTag}</head>`);
      }
    }

    // Inject JS
    if (jsCode) {
      const scriptTag = `<script>\n${jsCode}\n</script>`;
      result = result.replace(/<\/body>/i, `${scriptTag}\n</body>`);
    }

    return result;
  }

  // Wrap in full document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${cssCode || ""}
  </style>
</head>
<body>
${htmlCode || ""}
  <script>
${jsCode || ""}
  </script>
</body>
</html>`;
}

module.exports = { runPuppeteerEvaluation };
