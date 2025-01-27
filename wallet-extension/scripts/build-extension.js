const fs = require('fs-extra');
const path = require('path');

async function buildExtension() {
  const outDir = path.join(__dirname, '../out');
  const publicDir = path.join(__dirname, '../public');

  try {
    // Copy manifest and icons
    await fs.copy(
      path.join(publicDir, 'manifest.json'),
      path.join(outDir, 'manifest.json')
    );
    
    await fs.copy(
      path.join(publicDir, 'icons'),
      path.join(outDir, 'icons')
    );

    console.log('Extension build completed successfully!');
  } catch (err) {
    console.error('Error building extension:', err);
    process.exit(1);
  }
}

buildExtension(); 