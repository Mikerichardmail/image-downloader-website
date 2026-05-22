import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { cloudflare } from "@cloudflare/vite-plugin";

function getHtmlInputs() {
  const inputs = {
    main: resolve(__dirname, 'index.html'),
    chrome: resolve(__dirname, 'chrome-extension.html'),
    firefox: resolve(__dirname, 'firefox-extension.html'),
    edge: resolve(__dirname, 'edge-extension.html'),
    brave: resolve(__dirname, 'brave-extension.html'),
    opera: resolve(__dirname, 'opera-extension.html'),
    pricing: resolve(__dirname, 'pricing.html'),
    about: resolve(__dirname, 'about.html'),
    contact: resolve(__dirname, 'contact.html'),
    privacy: resolve(__dirname, 'privacy-policy.html'),
    terms: resolve(__dirname, 'terms-of-service.html'),
  };

  const blogDir = resolve(__dirname, 'blog');
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir);
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const name = `blog/${file.replace('.html', '')}`;
        inputs[name] = resolve(blogDir, file);
      }
    });
  }

  return inputs;
}

export default defineConfig({
  plugins: [cloudflare()],
  build: {
    rollupOptions: {
      input: getHtmlInputs()
    }
  }
});