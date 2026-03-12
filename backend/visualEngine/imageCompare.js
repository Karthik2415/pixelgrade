const fs = require("fs");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

// Fixed target dimensions matching Puppeteer's viewport
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;

/**
 * Compare two PNG images using pixelmatch.
 * Both images are normalized to the same fixed dimensions (1280x720)
 * before comparison, ensuring consistent results regardless of source sizes.
 *
 * @param {string} expectedPath - Path to the expected (reference) screenshot
 * @param {string} actualPath   - Path to the actual (student) screenshot
 * @param {string} diffPath     - Path to save the diff heatmap image
 * @returns {Object} { mismatchPercentage, mismatchedPixels, totalPixels, diffImagePath }
 */
async function compareImages(expectedPath, actualPath, diffPath) {
  return new Promise((resolve, reject) => {
    try {
      // ── Read images ──────────────────────────────────────────────
      const expectedData = fs.readFileSync(expectedPath);
      const actualData = fs.readFileSync(actualPath);

      const expectedImg = PNG.sync.read(expectedData);
      const actualImg = PNG.sync.read(actualData);

      // ── Normalize both images to the same fixed dimensions ──────
      const normalizedExpected = normalizeToTarget(expectedImg, TARGET_WIDTH, TARGET_HEIGHT);
      const normalizedActual = normalizeToTarget(actualImg, TARGET_WIDTH, TARGET_HEIGHT);

      // ── Create diff image ────────────────────────────────────────
      const diff = new PNG({ width: TARGET_WIDTH, height: TARGET_HEIGHT });

      // Run pixelmatch comparison
      const mismatchedPixels = pixelmatch(
        normalizedExpected.data,
        normalizedActual.data,
        diff.data,
        TARGET_WIDTH,
        TARGET_HEIGHT,
        {
          threshold: 0.1,           // Color difference threshold
          alpha: 0.1,               // Blending factor for unchanged pixels
          diffColor: [255, 0, 0],   // Red for mismatched pixels
          diffColorAlt: [0, 255, 0], // Green for anti-aliased differences
          includeAA: true,          // Include anti-aliased pixel detection
          aaColor: [255, 255, 0],   // Yellow for anti-aliased pixels
        }
      );

      const totalPixels = TARGET_WIDTH * TARGET_HEIGHT;
      const mismatchPercentage = (mismatchedPixels / totalPixels) * 100;

      // ── Write diff image ─────────────────────────────────────────
      const diffBuffer = PNG.sync.write(diff);
      fs.writeFileSync(diffPath, diffBuffer);

      resolve({
        mismatchPercentage,
        mismatchedPixels,
        totalPixels,
        diffImagePath: diffPath,
        dimensions: { width: TARGET_WIDTH, height: TARGET_HEIGHT },
      });
    } catch (error) {
      reject(new Error(`Image comparison failed: ${error.message}`));
    }
  });
}

/**
 * Normalize an image to the target dimensions by proportionally scaling
 * and centering it on a white canvas.
 * 
 * - If the image is larger than the target, it is scaled down to fit.
 * - If the image is smaller, it is scaled up to fit.
 * - Aspect ratio is preserved and the image is centered.
 */
function normalizeToTarget(img, targetWidth, targetHeight) {
  // If already the target size, return as-is
  if (img.width === targetWidth && img.height === targetHeight) {
    return img;
  }

  const result = new PNG({ width: targetWidth, height: targetHeight });

  // Fill with white (255, 255, 255, 255)
  for (let i = 0; i < result.data.length; i += 4) {
    result.data[i] = 255;     // R
    result.data[i + 1] = 255; // G
    result.data[i + 2] = 255; // B
    result.data[i + 3] = 255; // A
  }

  // Calculate scale to fit within target while preserving aspect ratio
  const scaleX = targetWidth / img.width;
  const scaleY = targetHeight / img.height;
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = Math.round(img.width * scale);
  const scaledHeight = Math.round(img.height * scale);

  // Center the scaled image on the canvas
  const offsetX = Math.round((targetWidth - scaledWidth) / 2);
  const offsetY = Math.round((targetHeight - scaledHeight) / 2);

  // Simple nearest-neighbor scaling + centering
  for (let y = 0; y < scaledHeight; y++) {
    for (let x = 0; x < scaledWidth; x++) {
      // Map back to source pixel
      const srcX = Math.min(Math.floor(x / scale), img.width - 1);
      const srcY = Math.min(Math.floor(y / scale), img.height - 1);

      const srcIdx = (srcY * img.width + srcX) * 4;
      const dstIdx = ((y + offsetY) * targetWidth + (x + offsetX)) * 4;

      result.data[dstIdx] = img.data[srcIdx];
      result.data[dstIdx + 1] = img.data[srcIdx + 1];
      result.data[dstIdx + 2] = img.data[srcIdx + 2];
      result.data[dstIdx + 3] = img.data[srcIdx + 3];
    }
  }

  return result;
}

module.exports = { compareImages };
