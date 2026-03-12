const fs = require("fs");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

/**
 * Compare two PNG images using pixelmatch.
 * Generates a diff image highlighting layout differences as a heatmap.
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

      // ── Normalize dimensions ─────────────────────────────────────
      // Use the larger dimensions to ensure we can compare
      const width = Math.max(expectedImg.width, actualImg.width);
      const height = Math.max(expectedImg.height, actualImg.height);

      // Resize images to same dimensions if needed
      const normalizedExpected = resizeImage(expectedImg, width, height);
      const normalizedActual = resizeImage(actualImg, width, height);

      // ── Create diff image ────────────────────────────────────────
      const diff = new PNG({ width, height });

      // Run pixelmatch comparison
      const mismatchedPixels = pixelmatch(
        normalizedExpected.data,
        normalizedActual.data,
        diff.data,
        width,
        height,
        {
          threshold: 0.1,           // Color difference threshold
          alpha: 0.1,               // Blending factor for unchanged pixels
          diffColor: [255, 0, 0],   // Red for mismatched pixels
          diffColorAlt: [0, 255, 0], // Green for anti-aliased differences
          includeAA: true,          // Include anti-aliased pixel detection
          aaColor: [255, 255, 0],   // Yellow for anti-aliased pixels
        }
      );

      const totalPixels = width * height;
      const mismatchPercentage = (mismatchedPixels / totalPixels) * 100;

      // ── Write diff image ─────────────────────────────────────────
      const diffBuffer = PNG.sync.write(diff);
      fs.writeFileSync(diffPath, diffBuffer);

      resolve({
        mismatchPercentage,
        mismatchedPixels,
        totalPixels,
        diffImagePath: diffPath,
        dimensions: { width, height },
      });
    } catch (error) {
      reject(new Error(`Image comparison failed: ${error.message}`));
    }
  });
}

/**
 * Resize an image to fit within the target dimensions.
 * If the source is smaller, the extra space is filled with white pixels.
 * If the source is larger, it is cropped to fit.
 */
function resizeImage(img, targetWidth, targetHeight) {
  if (img.width === targetWidth && img.height === targetHeight) {
    return img;
  }

  const resized = new PNG({ width: targetWidth, height: targetHeight });

  // Fill with white (255, 255, 255, 255)
  for (let i = 0; i < resized.data.length; i += 4) {
    resized.data[i] = 255;     // R
    resized.data[i + 1] = 255; // G
    resized.data[i + 2] = 255; // B
    resized.data[i + 3] = 255; // A
  }

  // Copy source pixels
  const copyWidth = Math.min(img.width, targetWidth);
  const copyHeight = Math.min(img.height, targetHeight);

  for (let y = 0; y < copyHeight; y++) {
    for (let x = 0; x < copyWidth; x++) {
      const srcIdx = (y * img.width + x) * 4;
      const dstIdx = (y * targetWidth + x) * 4;

      resized.data[dstIdx] = img.data[srcIdx];
      resized.data[dstIdx + 1] = img.data[srcIdx + 1];
      resized.data[dstIdx + 2] = img.data[srcIdx + 2];
      resized.data[dstIdx + 3] = img.data[srcIdx + 3];
    }
  }

  return resized;
}

module.exports = { compareImages };
