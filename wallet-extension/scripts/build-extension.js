const fs = require('fs-extra');
const path = require('path');

async function buildExtension() {
  const buildDir = path.join(__dirname, '../build');
  const outDir = path.join(__dirname, '../out');
  const publicDir = path.join(__dirname, '../public');

  try {
    // Clean out directory
    await fs.remove(outDir);
    await fs.ensureDir(outDir);

    // Copy build files
    await fs.copy(buildDir, outDir);

    // Copy manifest and icons
    await fs.copy(
      path.join(publicDir, 'manifest.json'),
      path.join(outDir, 'manifest.json')
    );
    
    await fs.copy(
      path.join(publicDir, 'icons'),
      path.join(outDir, 'icons')
    );

    // Rename _next directory to assets
    if (await fs.pathExists(path.join(outDir, '_next'))) {
      await fs.move(
        path.join(outDir, '_next'),
        path.join(outDir, 'assets'),
        { overwrite: true }
      );

      // Update all HTML files to use the new assets path
      const htmlFiles = await fs.readdir(outDir);
      for (const file of htmlFiles) {
        if (file.endsWith('.html')) {
          const filePath = path.join(outDir, file);
          let content = await fs.readFile(filePath, 'utf8');
          content = content.replace(/\/_next\//g, '/assets/');
          await fs.writeFile(filePath, content);
        }
      }
    }

    console.log('Extension build completed successfully!');
  } catch (err) {
    console.error('Error building extension:', err);
    process.exit(1);
  }
}

buildExtension(); 