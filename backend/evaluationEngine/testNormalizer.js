/**
 * Test Case Normalizer
 *
 * Converts user-friendly test case JSON formats into the internal format
 * expected by domTestRunner.js and interactionTestRunner.js.
 *
 * Handles:
 *   - snake_case keys (dom_tests → domTests, interaction_tests → interactionTests)
 *   - User-friendly DOM test fields (expected_text, type="input") → internal (type="exists", type="textContains")
 *   - User-friendly interaction test fields (action, input, expected) → internal (actions[], verify{})
 */

/**
 * Normalize the top-level test cases object.
 * Accepts any combination of key formats and returns { domTests, interactionTests }.
 *
 * @param {Object} testCases - Raw test cases from the question document
 * @returns {Object} { domTests: [], interactionTests: [] }
 */
function normalizeTestCases(testCases) {
  if (!testCases || typeof testCases !== "object") {
    return { domTests: [], interactionTests: [] };
  }

  // ── Extract DOM tests (support both key formats) ───────────────────
  const rawDomTests =
    testCases.domTests ||
    testCases.dom_tests ||
    testCases.DomTests ||
    testCases.DOM_TESTS ||
    [];

  // ── Extract Interaction tests (support both key formats) ───────────
  const rawInteractionTests =
    testCases.interactionTests ||
    testCases.interaction_tests ||
    testCases.InteractionTests ||
    testCases.INTERACTION_TESTS ||
    [];

  return {
    domTests: rawDomTests.map(normalizeDomTest),
    interactionTests: rawInteractionTests.map(normalizeInteractionTest),
  };
}

/**
 * Normalize a single DOM test case.
 *
 * User-friendly format:
 *   { selector: "h1", expected_text: "Todo List", type: "input", score: 5 }
 *
 * Internal format:
 *   { selector: "h1", type: "textContains", expected: "Todo List", description: "..." }
 */
function normalizeDomTest(test) {
  const selector = test.selector || "body";
  const description = test.description || test.id || `DOM test: ${selector}`;

  // If the test already has a valid runner type, pass through
  const validRunnerTypes = [
    "exists", "notExists", "textContains", "textEquals",
    "hasAttribute", "attrEquals", "hasClass", "childCount",
    "tagName", "isVisible",
  ];

  if (validRunnerTypes.includes(test.type)) {
    return {
      selector,
      type: test.type,
      expected: test.expected || test.expected_text || null,
      description,
    };
  }

  // ── Auto-detect the type from available fields ───────────────────
  // If expected_text is present → textContains check
  if (test.expected_text) {
    return {
      selector,
      type: "textContains",
      expected: test.expected_text,
      description,
    };
  }

  // If type is an HTML element name (input, button, ul, div, etc.) → exists check
  const htmlElements = [
    "input", "button", "ul", "ol", "li", "div", "span", "p", "h1", "h2",
    "h3", "h4", "h5", "h6", "a", "img", "form", "select", "textarea",
    "table", "nav", "section", "header", "footer", "main", "article",
  ];

  if (test.type && htmlElements.includes(test.type.toLowerCase())) {
    // The "type" field refers to the expected HTML tag, not the test type
    return {
      selector,
      type: "exists",
      expected: null,
      description,
    };
  }

  // Default: exists check
  return {
    selector,
    type: "exists",
    expected: test.expected || null,
    description,
  };
}

/**
 * Normalize a single interaction test case.
 *
 * User-friendly format:
 *   { action: "Add Task", input: "Test Task", expected: "New task appears in list", score: 10 }
 *
 * Internal format (when selectors are available):
 *   { description: "...", actions: [{ type, selector, value }], verify: { selector, type, expected } }
 *
 * When only human-readable descriptions are provided, we create a best-effort test
 * that passes if the actions complete without error.
 */
function normalizeInteractionTest(test) {
  const description = test.description || test.id || test.action || "Interaction test";

  // If the test already has the internal format (actions array), pass through
  if (test.actions && Array.isArray(test.actions)) {
    return {
      description,
      actions: test.actions,
      verify: test.verify || null,
    };
  }

  // ── Convert user-friendly format to internal format ────────────────
  // Try to build actions from the simplified format
  const actions = [];
  const verify = null;

  // If there's a selector and action type, build a proper action
  if (test.selector && test.action_type) {
    actions.push({
      type: test.action_type,
      selector: test.selector,
      value: test.input || test.value || "",
    });
  }
  // If there's an input_selector and click_selector, build type + click
  if (test.input_selector && test.click_selector) {
    actions.push({
      type: "type",
      selector: test.input_selector,
      value: test.input || test.value || "Test",
    });
    actions.push({
      type: "click",
      selector: test.click_selector,
    });
  }

  // Build verify from expected fields
  let verifyObj = null;
  if (test.verify) {
    verifyObj = test.verify;
  } else if (test.verify_selector) {
    verifyObj = {
      selector: test.verify_selector,
      type: test.verify_type || "exists",
      expected: test.expected || null,
    };
  }

  return {
    description,
    actions,
    verify: verifyObj,
  };
}

module.exports = { normalizeTestCases };
