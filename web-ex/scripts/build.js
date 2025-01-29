const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

async function buildExtension() {
  try {
    // Clean directories
    console.log('Cleaning directories...');
    await fs.remove(path.join(__dirname, '../.next'));
    await fs.remove(path.join(__dirname, '../out'));
    await fs.remove(path.join(__dirname, '../dist'));

    // Build Next.js app
    console.log('Building Next.js app...');
    await execCommand('next build && next export');

    // Create dist directory
    const distDir = path.join(__dirname, '../dist');
    await fs.ensureDir(distDir);

    // Copy out directory to dist
    console.log('Copying build files...');
    const outDir = path.join(__dirname, '../out');
    
    if (!fs.existsSync(outDir)) {
      throw new Error('Build output directory not found');
    }

    // Copy all files from out to dist
    await fs.copy(outDir, distDir);

    // Rename _next directory to assets
    await fs.move(
      path.join(distDir, '_next'),
      path.join(distDir, 'assets'),
      { overwrite: true }
    );

    // Update paths in HTML files
    const htmlFiles = await fs.readdir(distDir);
    for (const file of htmlFiles) {
      if (file.endsWith('.html')) {
        const filePath = path.join(distDir, file);
        let content = await fs.readFile(filePath, 'utf8');
        content = content
          .replace(/\/_next\//g, './assets/')
          .replace(/"\/assets\//g, '"./assets/')
          .replace(/href="\/([^/])/g, 'href="./$1')
          .replace(/src="\/([^/])/g, 'src="./$1');
        await fs.writeFile(filePath, content);
      }
    }

    // Copy extension files
    console.log('Copying extension files...');
    await fs.copy(
      path.join(__dirname, '../public/manifest.json'),
      path.join(distDir, 'manifest.json')
    );
    await fs.copy(
      path.join(__dirname, '../public/background.js'),
      path.join(distDir, 'background.js')
    );
    await fs.copy(
      path.join(__dirname, '../public/contentScript.js'),
      path.join(distDir, 'contentScript.js')
    );
    await fs.copy(
      path.join(__dirname, '../public/icons'),
      path.join(distDir, 'icons')
    );

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(stdout);
        console.error(stderr);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

buildExtension(); 