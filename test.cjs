const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const test = require('node:test');
const assert = require('node:assert');

const ROOT_DIR = __dirname;

function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.wrangler' && file !== 'dist') {
        results = results.concat(getAllHtmlFiles(fullPath));
      }
    } else if (file.endsWith('.html') && !file.endsWith('imagedownloader-schema-faqs.html') && !file.endsWith('read.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

test('Performance Optimization Verification Suite', async (t) => {
  const htmlFiles = getAllHtmlFiles(ROOT_DIR);

  await t.test('1. Verify HTML files are present', () => {
    assert.ok(htmlFiles.length >= 23, `Expected at least 23 HTML files, found ${htmlFiles.length}`);
  });

  await t.test('2. Verify Render-Blocking Google Font imports are removed from style.css', () => {
    const cssPath = path.join(ROOT_DIR, 'src', 'css', 'style.css');
    assert.ok(fs.existsSync(cssPath), 'style.css must exist');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const hasImport = cssContent.includes('@import') && cssContent.includes('fonts.googleapis.com');
    assert.strictEqual(hasImport, false, 'style.css must not contain render-blocking font imports');
  });

  await t.test('3. Verify Preconnect and Async Google Fonts are present in all HTML heads', () => {
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(ROOT_DIR, file);

      // Verify preconnects
      assert.ok(
        content.includes('href="https://fonts.googleapis.com"'),
        `${relativePath} is missing fonts.googleapis.com preconnect link`
      );
      assert.ok(
        content.includes('href="https://fonts.gstatic.com"'),
        `${relativePath} is missing fonts.gstatic.com preconnect link`
      );

      // Verify async stylesheet preload/load swapping pattern
      assert.ok(
        content.includes('rel="preload" as="style"'),
        `${relativePath} is missing fonts stylesheet preload link`
      );
      assert.ok(
        content.includes('media="print" onload="this.media=\'all\'"'),
        `${relativePath} is missing fonts onload print swap handler`
      );
    });
  });

  await t.test('4. Verify Chrome extension badge is localized to prevent external network overhead', () => {
    const badgePath = path.join(ROOT_DIR, 'src', 'images', 'crx-badge-install.png');
    assert.ok(fs.existsSync(badgePath), 'Local crx-badge-install.png must exist');
    const stats = fs.statSync(badgePath);
    assert.ok(stats.size > 1000, 'Local crx-badge-install.png size should be valid (>1KB)');
  });

  await t.test('5. Verify Chrome badge is localized in index.html with CLS prevention attributes', () => {
    const indexPath = path.join(ROOT_DIR, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');

    // Confirm local badge reference
    assert.ok(
      content.includes('/src/images/crx-badge-install.png'),
      'index.html must use the localized badge image path'
    );

    // Confirm CLS attributes (width & height)
    assert.ok(
      content.includes('width="170"') && content.includes('height="48"'),
      'index.html badge image must specify width="170" and height="48" to prevent Cumulative Layout Shift'
    );
  });

  await t.test('6. Verify Chrome badge is localized in main.js with CLS prevention attributes', () => {
    const jsPath = path.join(ROOT_DIR, 'src', 'js', 'main.js');
    assert.ok(fs.existsSync(jsPath), 'main.js must exist');
    const content = fs.readFileSync(jsPath, 'utf8');

    // Confirm local path reference
    assert.ok(
      content.includes('/src/images/crx-badge-install.png'),
      'main.js must reference the localized badge image path'
    );

    // Confirm CLS attributes
    assert.ok(
      content.includes('width="170"') && content.includes('height="48"'),
      'main.js generated HTML must specify width="170" and height="48" to prevent CLS'
    );
  });

  await t.test('7. Verify Vite production build executes successfully and outputs dist assets', () => {
    try {
      console.log('Running production build verification...');
      execSync('npm run build', { cwd: ROOT_DIR, stdio: 'pipe' });
      
      const distIndex = path.join(ROOT_DIR, 'dist', 'index.html');
      assert.ok(fs.existsSync(distIndex), 'Vite build failed: dist/index.html is missing');
      
      const distAssetsDir = path.join(ROOT_DIR, 'dist', 'assets');
      assert.ok(fs.existsSync(distAssetsDir), 'Vite build failed: dist/assets folder is missing');
      
      const files = fs.readdirSync(distAssetsDir);
      assert.ok(files.length > 0, 'Vite build failed: dist/assets folder is empty');
      console.log('Production build successfully compiled and verified!');
    } catch (err) {
      assert.fail(`Build compilation failed: ${err.message}`);
    }
  });
});
