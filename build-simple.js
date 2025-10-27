// Simple build script for testing without full webpack setup
const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy manifest.json
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

// Copy images
const imgDir = path.join(__dirname, 'img');
const distImgDir = path.join(distDir, 'img');
if (!fs.existsSync(distImgDir)) {
  fs.mkdirSync(distImgDir);
}

fs.readdirSync(imgDir).forEach(file => {
  fs.copyFileSync(
    path.join(imgDir, file),
    path.join(distImgDir, file)
  );
});

// Create simple JS files from TS (basic conversion for testing)
const createSimpleJS = (tsContent, outputPath) => {
  // Very basic TS to JS conversion - remove types and interfaces
  let jsContent = tsContent
    .replace(/^import.*?;$/gm, '') // Remove imports for now
    .replace(/^export.*?interface.*?{[\s\S]*?}$/gm, '') // Remove interfaces
    .replace(/: [^=,;){\n]+/g, '') // Remove type annotations
    .replace(/^export\s+/gm, '') // Remove exports
    .replace(/chrome\./g, 'chrome.'); // Keep chrome API calls
  
  fs.writeFileSync(outputPath, jsContent);
};

// Create background.js
const backgroundTS = fs.readFileSync(path.join(__dirname, 'src', 'background.ts'), 'utf8');
createSimpleJS(backgroundTS, path.join(distDir, 'background.js'));

// Create content.js
const contentTS = fs.readFileSync(path.join(__dirname, 'src', 'content.ts'), 'utf8');
createSimpleJS(contentTS, path.join(distDir, 'content.js'));

// Create options.js
const optionsTS = fs.readFileSync(path.join(__dirname, 'src', 'options.ts'), 'utf8');
createSimpleJS(optionsTS, path.join(distDir, 'options.js'));

// Create simple options.html
const optionsHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Copy as Org-Mode - Options</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
    .option { margin: 15px 0; }
    label { display: flex; align-items: center; cursor: pointer; }
    input[type="checkbox"] { margin-right: 10px; }
    .description { font-size: 12px; color: #666; margin-left: 22px; margin-top: 5px; }
    #saveStatus { display: none; padding: 10px; background: #d4edda; color: #155724; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Copy as Org-Mode Options</h1>
  
  <div class="option">
    <label>
      <input type="checkbox" id="decodeUri" checked>
      Decode URIs when copying links
    </label>
    <div class="description">When enabled, encoded URIs will be decoded for better readability</div>
  </div>
  
  <div class="option">
    <label>
      <input type="checkbox" id="preserveFormatting" checked>
      Preserve basic text formatting
    </label>
    <div class="description">Maintain bold, italic, and other basic formatting when converting to Org-mode</div>
  </div>
  
  <div class="option">
    <label>
      <input type="checkbox" id="convertTables" checked>
      Convert HTML tables to Org-mode tables
    </label>
    <div class="description">Automatically convert HTML table structures to Org-mode table format</div>
  </div>
  
  <div class="option">
    <label>
      <input type="checkbox" id="showNotifications" checked>
      Show copy notifications
    </label>
    <div class="description">Display a notification when content is successfully copied</div>
  </div>
  
  <div id="saveStatus">Settings saved successfully!</div>
  
  <script src="options.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'options_ui.html'), optionsHTML);

console.log('Simple build completed! Extension files are in the dist/ directory.');
console.log('To load in Edge/Chrome:');
console.log('1. Go to edge://extensions/ or chrome://extensions/');
console.log('2. Enable Developer mode');
console.log('3. Click "Load unpacked" and select the dist/ folder');
