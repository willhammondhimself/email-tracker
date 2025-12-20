/**
 * Simple icon generator script
 * Creates placeholder icons if you don't have image editing software
 *
 * Run with: node create-icons.js
 * Requires: sharp library (npm install sharp)
 */

const fs = require('fs');
const path = require('path');

// Create a simple colored square icon
async function createIcon(size, filename) {
  // For simplicity, we'll create SVG icons that can be converted
  // This is a basic purple gradient square with an envelope emoji

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="50%" y="50%" font-size="${size * 0.6}" text-anchor="middle" dominant-baseline="central">📧</text>
    </svg>
  `;

  fs.writeFileSync(filename, svg);
  console.log(`✅ Created ${filename} (${size}x${size})`);
}

// Create all three required sizes
console.log('Creating placeholder icons...\n');

createIcon(16, path.join(__dirname, 'icon16.svg'));
createIcon(48, path.join(__dirname, 'icon48.svg'));
createIcon(128, path.join(__dirname, 'icon128.svg'));

console.log('\n📝 Note: These are SVG files. For best results:');
console.log('1. Convert to PNG using an online tool like https://cloudconvert.com/svg-to-png');
console.log('2. Or install sharp and use the convert-to-png.js script');
console.log('3. Or use any image editor to create custom PNG icons\n');
