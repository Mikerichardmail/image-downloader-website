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
    bulk: resolve(__dirname, 'bulk-image-downloader.html'),
    error404: resolve(__dirname, '404.html'),
    install: resolve(__dirname, 'install.html'),
    uninstall: resolve(__dirname, 'uninstall.html'),
    imagedownloader: resolve(__dirname, 'image-downloader.html'),
    imagedownloaderonline: resolve(__dirname, 'image-downloader-online.html'),
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
  plugins: [
    process.env.NODE_ENV !== 'production' && cloudflare(),
    {
      name: 'async-css-plugin',
      transformIndexHtml(html) {
        // Find any link tag containing rel="stylesheet"
        const linkRegex = /<link\s+([\s\S]*?)>/gi;
        
        let newHtml = html.replace(linkRegex, (fullMatch, attributes) => {
          if (/rel=["']stylesheet["']/i.test(attributes)) {
            const hrefMatch = attributes.match(/href=["']([^"']+)["']/i);
            if (hrefMatch) {
              const cssUrl = hrefMatch[1];
              return `<!-- Critical CSS inlined to prevent white flash -->
  <style>
    :root {
      --bg-primary: #0b0f19;
      --text-primary: #f9fafb;
    }
    body {
      background-color: #0b0f19;
      color: #f9fafb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  </style>
  <link rel="preload" href="${cssUrl}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="${cssUrl}"></noscript>`;
            }
          }
          return fullMatch;
        });
        
        return newHtml;
      }
    }
  ].filter(Boolean),
  build: {
    rollupOptions: {
      input: getHtmlInputs()
    }
  }
});