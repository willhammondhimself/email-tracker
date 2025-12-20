const crypto = require('crypto');
const sharp = require('sharp');

/**
 * Generates a unique tracking ID
 * @returns {string} A unique tracking identifier
 */
function generateTrackingId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates a 1x1 transparent PNG pixel
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function generateTransparentPixel() {
  try {
    // Create a 1x1 transparent PNG using sharp
    const pixel = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .png()
    .toBuffer();

    return pixel;
  } catch (error) {
    console.error('Error generating pixel:', error);

    // Fallback: Return a minimal PNG manually
    // This is a base64-encoded 1x1 transparent PNG
    const fallbackPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    return fallbackPixel;
  }
}

module.exports = {
  generateTrackingId,
  generateTransparentPixel
};
