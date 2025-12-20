# Extension Icons

You need to add three icon files to this directory:

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Quick Icon Generation

### Option 1: Use an Online Tool
Visit https://www.favicon-generator.org/ or https://realfavicongenerator.net/
Upload any image and download the generated icons in different sizes.

### Option 2: Use ImageMagick (Command Line)
```bash
# If you have a source image (logo.png), generate all sizes:
convert logo.png -resize 16x16 icon16.png
convert logo.png -resize 48x48 icon48.png
convert logo.png -resize 128x128 icon128.png
```

### Option 3: Simple Placeholder Icons
For testing, you can use emoji or simple colored squares:
- Use any emoji to image converter
- Or create simple colored squares in any image editor

## Recommended Icon Design
- Use a simple envelope 📧 or chart 📊 icon
- Colors: Purple gradient (#667eea to #764ba2) to match the extension theme
- Make sure the icon is clear and recognizable at 16x16 size
