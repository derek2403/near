const fs = require('fs-extra');
const path = require('path');

async function prepareExtension() {
  const distDir = path.join(process.cwd(), 'dist');
  const outDir = path.join(process.cwd(), 'extension');

  // Clean and create extension directory
  await fs.remove(outDir);
  await fs.ensureDir(outDir);
  await fs.ensureDir(path.join(outDir, 'icons'));

  // Copy static assets
  await fs.copy(distDir, outDir, {
    filter: (src) => !src.includes('_next') // Exclude _next directory
  });

  // Copy and rename necessary files from _next
  const nextDir = path.join(distDir, '_next');
  if (await fs.exists(nextDir)) {
    await fs.copy(
      path.join(nextDir, 'static'),
      path.join(outDir, 'static')
    );
  }

  // Copy manifest
  await fs.copy(
    path.join(process.cwd(), 'public', 'manifest.json'),
    path.join(outDir, 'manifest.json')
  );

  // Create placeholder icons
  const sizes = [16, 48, 128];
  for (const size of sizes) {
    await fs.copy(
      path.join(process.cwd(), 'public', 'icons', 'icon.svg'),
      path.join(outDir, 'icons', `icon-${size}.png`)
    );
  }

  // Rename popup/index.html to popup.html
  if (await fs.exists(path.join(outDir, 'popup.html'))) {
    await fs.remove(path.join(outDir, 'popup.html'));
  }
  await fs.move(
    path.join(outDir, 'popup', 'index.html'),
    path.join(outDir, 'popup.html'),
    { overwrite: true }
  );

  // Clean up unnecessary files and directories
  await fs.remove(path.join(outDir, 'popup'));
  await fs.remove(path.join(outDir, '_next'));

  console.log('Extension files prepared successfully!');
}

prepareExtension().catch(console.error); 