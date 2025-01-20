const fs = require('fs')
const path = require('path')

// Create icons directory
fs.mkdirSync(path.join(__dirname, '../out/icons'), { recursive: true })

// Copy manifest.json
fs.copyFileSync(
  path.join(__dirname, '../public/manifest.json'),
  path.join(__dirname, '../out/manifest.json')
)

// Copy background.js
fs.copyFileSync(
  path.join(__dirname, '../public/background.js'),
  path.join(__dirname, '../out/background.js')
)

// Copy existing icons
const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png']
iconFiles.forEach(filename => {
  try {
    fs.copyFileSync(
      path.join(__dirname, `../public/icons/${filename}`),
      path.join(__dirname, `../out/icons/${filename}`)
    )
    console.log(`Successfully copied ${filename}`)
  } catch (err) {
    console.warn(`Warning: Error copying ${filename}:`, err.message)
  }
}) 