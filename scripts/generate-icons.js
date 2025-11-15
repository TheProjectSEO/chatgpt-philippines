/**
 * PWA Icon Generator
 * Generates all required app icons from a single SVG template
 *
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Color scheme
const COLORS = {
  primary: '#E8844A', // Desert Titanium Orange
  text: '#FFFFFF',
  accent: '#D46D38'
};

/**
 * Generate SVG icon template
 */
function generateSVG(size) {
  const fontSize = Math.round(size * 0.4);
  const strokeWidth = Math.round(size * 0.02);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${COLORS.accent};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="${strokeWidth}" stdDeviation="${strokeWidth * 2}" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background with rounded corners -->
  <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bgGradient)"/>

  <!-- PH Text -->
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="${COLORS.text}"
    text-anchor="middle"
    dominant-baseline="central"
    filter="url(#shadow)"
  >PH</text>

  <!-- Small AI accent dot -->
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.05}" fill="${COLORS.text}" opacity="0.9"/>
</svg>`;
}

/**
 * Generate all icon sizes
 */
function generateIcons() {
  const iconsDir = path.join(__dirname, '../public/icons');

  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('🎨 Generating PWA icons...\n');

  ICON_SIZES.forEach(size => {
    const svg = generateSVG(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(iconsDir, filename);

    fs.writeFileSync(filepath, svg, 'utf8');
    console.log(`✅ Generated: ${filename} (${size}x${size})`);
  });

  // Generate favicon.ico sized SVG
  const faviconSVG = generateSVG(32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSVG, 'utf8');
  console.log(`✅ Generated: favicon.svg (32x32)`);

  // Generate apple-touch-icon
  const appleTouchIcon = generateSVG(180);
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon, 'utf8');
  console.log(`✅ Generated: apple-touch-icon.svg (180x180)`);

  console.log('\n✨ Icon generation complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Convert SVG to PNG using: https://svgtopng.com/ or');
  console.log('2. Use ImageMagick: brew install imagemagick');
  console.log('3. Run: node scripts/convert-icons-to-png.js (if available)\n');
  console.log('Or use online tool: https://realfavicongenerator.net/\n');
}

// Run generator
try {
  generateIcons();
} catch (error) {
  console.error('❌ Error generating icons:', error.message);
  process.exit(1);
}
