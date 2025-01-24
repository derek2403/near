const fs = require('fs');
const path = require('path');

// Function to copy directory contents recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Create a temporary directory
const tempDir = path.join(__dirname, '../temp');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir);

// Copy the _next directory contents to assets
const nextDir = path.join(__dirname, '../out/_next');
const assetsDir = path.join(tempDir, 'assets');
if (fs.existsSync(nextDir)) {
  copyDir(nextDir, assetsDir);
}

// Copy other necessary files
const filesToCopy = ['index.html', 'background.js', 'manifest.json'];
const iconsDir = path.join(__dirname, '../out/icons');
if (fs.existsSync(iconsDir)) {
  copyDir(iconsDir, path.join(tempDir, 'icons'));
}

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, '../out', file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(tempDir, file));
  }
});

// Update the index.html file to use the new assets path
const indexPath = path.join(tempDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  indexContent = indexContent.replace(/\/_next\//g, '/assets/');
  fs.writeFileSync(indexPath, indexContent);
}

// Clean up the out directory and move temp contents
const outDir = path.join(__dirname, '../out');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
}
fs.renameSync(tempDir, outDir); 