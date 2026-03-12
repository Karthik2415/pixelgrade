/**
 * Score Calculator
 *
 * Scoring weights:
 *   DOM Score         → 40 points max
 *   Interaction Score → 30 points max
 *   Visual Score      → 30 points max
 *   Total             → 100 points max
 *
 * DOM & Interaction scores are based on pass/fail ratio.
 * Visual score is based on pixel match percentage (inverse of mismatch).
 */

const WEIGHTS = {
  DOM: 40,
  INTERACTION: 30,
  VISUAL: 30,
};

/**
 * Calculate weighted scores from test results and visual comparison.
 *
 * @param {Object} params
 * @param {Array}  params.domTestResults         - Array of { passed: boolean }
 * @param {Array}  params.interactionTestResults  - Array of { passed: boolean }
 * @param {number} params.mismatchPercentage     - 0–100, from pixelmatch
 * @returns {Object} { domScore, interactionScore, visualScore, totalScore, breakdown }
 */
function calculateScore({
  domTestResults = [],
  interactionTestResults = [],
  mismatchPercentage = 100,
}) {
  // ── DOM Score ──────────────────────────────────────────────────────
  let domScore = 0;
  let domPassRate = 0;

  if (domTestResults.length > 0) {
    const passed = domTestResults.filter((t) => t.passed).length;
    domPassRate = passed / domTestResults.length;
    domScore = Math.round(domPassRate * WEIGHTS.DOM * 100) / 100;
  }

  // ── Interaction Score ──────────────────────────────────────────────
  let interactionScore = 0;
  let interactionPassRate = 0;

  if (interactionTestResults.length > 0) {
    const passed = interactionTestResults.filter((t) => t.passed).length;
    interactionPassRate = passed / interactionTestResults.length;
    interactionScore = Math.round(interactionPassRate * WEIGHTS.INTERACTION * 100) / 100;
  }

  // ── Visual Score ───────────────────────────────────────────────────
  // Visual scoring uses a penalty multiplier to make small pixel mismatches
  // count heavily. On a 1280x720 canvas, even a 2% mismatch means significant
  // visual differences. With a 10x multiplier:
  //   0% mismatch → 30/30,  2% → 24/30,  5% → 15/30,  10% → 0/30
  const penaltyMultiplier = 10;
  const matchPercentage = Math.max(0, 100 - (mismatchPercentage * penaltyMultiplier));
  const visualScore = Math.round((matchPercentage / 100) * WEIGHTS.VISUAL * 100) / 100;

  // ── Total Score ────────────────────────────────────────────────────
  const totalScore = Math.round((domScore + interactionScore + visualScore) * 100) / 100;

  return {
    domScore,
    interactionScore,
    visualScore,
    totalScore,
    breakdown: {
      dom: {
        score: domScore,
        maxScore: WEIGHTS.DOM,
        passRate: domPassRate,
        testsPassed: domTestResults.length > 0 ? domTestResults.filter((t) => t.passed).length : 0,
        totalTests: domTestResults.length,
      },
      interaction: {
        score: interactionScore,
        maxScore: WEIGHTS.INTERACTION,
        passRate: interactionPassRate,
        testsPassed: interactionTestResults.length > 0 ? interactionTestResults.filter((t) => t.passed).length : 0,
        totalTests: interactionTestResults.length,
      },
      visual: {
        score: visualScore,
        maxScore: WEIGHTS.VISUAL,
        matchPercentage: matchPercentage,
        mismatchPercentage: mismatchPercentage,
      },
    },
  };
}

module.exports = { calculateScore, WEIGHTS };
