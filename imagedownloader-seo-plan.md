# imagedownloader.org — Full Website & SEO Master Plan

---

## Overview

**Domain:** imagedownloader.org  
**Product:** Free web-based bulk image downloader + paid Chrome & Firefox browser extension (ImageMaster Pro)  
**Monetisation:** Gumroad one-time purchase — ~~$99~~ $5.99 promo  
**Gumroad:** https://adshieldpro.gumroad.com/l/rrsgqp  
**Chrome Extension:** https://chromewebstore.google.com/detail/image-downloader-imagemas/hmghdknfmhfbbdedplpdakfbhflfikhm  
**Firefox Extension:** https://addons.mozilla.org/en-US/firefox/addon/bulk-image-download/  
**Contact:** admin@imagedownloader.org  
**Extension name on Chrome:** Image Downloader - ImageMaster  
**Developer:** ConverterWordToPDF Labs  

---

## Site Architecture

```
imagedownloader.org/
├── /                          → Homepage (free tool + main keyword landing page)
├── /chrome-extension          → Chrome extension page
├── /firefox-extension         → Firefox extension page
├── /pricing                   → Pro pricing & Gumroad checkout
├── /about                     → About page (E-E-A-T trust signal)
├── /privacy-policy            → Required by Google, Chrome Store, Firefox AMO
├── /terms-of-service          → Required for legal compliance
├── /contact                   → Contact page with admin@imagedownloader.org
├── /sitemap.xml               → Auto-generated, submitted to Google Search Console
├── /robots.txt                → Allow all, point to sitemap
└── /blog/                     → Blog index
    ├── /blog/how-to-bulk-download-images-from-any-website
    ├── /blog/best-image-downloader-chrome-extensions
    ├── /blog/how-to-download-images-from-instagram
    ├── /blog/how-to-download-images-from-pinterest
    ├── /blog/how-to-download-all-images-from-a-website
    ├── /blog/image-downloader-firefox-addon-guide
    ├── /blog/how-to-save-images-from-amazon
    ├── /blog/bulk-download-product-images-ecommerce
    ├── /blog/webp-to-jpg-converter-browser-extension
    ├── /blog/best-bulk-image-downloader-2026
    ├── /blog/how-to-download-images-without-right-clicking
    └── /blog/image-scraper-for-designers-developers
```

---

## Global SEO Rules (Apply to Every Page)

### Technical Requirements
- Load time under 2 seconds (static HTML on Cloudflare Pages)
- Mobile-first responsive design
- HTTPS enforced via Cloudflare (free)
- No render-blocking scripts
- All images have descriptive `alt` attributes
- Canonical tags on every page to prevent duplicate content
- Open Graph and Twitter Card meta tags on every page
- Google Search Console verified from day one
- Sitemap.xml submitted to Google Search Console immediately after launch

### On-Page SEO Rules
- Primary keyword in `<title>`, `<h1>`, first 100 words, URL slug, and meta description
- Meta description between 150–160 characters, includes keyword and a call to action
- One `<h1>` per page only
- Subheadings use `<h2>` and `<h3>` with secondary keywords
- Internal links between every related page
- FAQ section on every page using `<details>` or accordion — targets Google featured snippets
- Schema markup on every page (type varies by page — see below)
- Minimum 600 words per page, blog posts minimum 1200 words

### E-E-A-T Signals (Experience, Expertise, Authority, Trust)
- About page with real developer/team info
- Privacy Policy and Terms of Service pages
- Contact page with real email (admin@imagedownloader.org)
- Consistent branding and name across Chrome Store, Firefox AMO, Gumroad, and website
- Extension version number and last updated date shown on extension pages

---

## Page-by-Page Build Plan

---

### 1. Homepage — `/`

**Target keyword:** bulk image downloader  
**Secondary keywords:** image downloader online, download images from website, save images from any webpage, free image downloader  
**Search intent:** Tool — user wants to use something right now

**`<title>`**  
`Bulk Image Downloader — Download All Images from Any Website Free`

**Meta description**  
`Free bulk image downloader. Paste any URL and download every image from any webpage instantly. No signup. Also available as Chrome and Firefox extensions.`

**`<h1>`**  
`Download Every Image. Instantly.`

**Schema markup**  
`WebApplication` + `SoftwareApplication`

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Downloader — imagedownloader.org",
  "url": "https://imagedownloader.org",
  "description": "Free bulk image downloader. Paste any URL and download all images from any webpage instantly.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

**Page Sections (in order)**
1. Hero — H1, subheadline, keyword-rich intro paragraph
2. Working free tool — URL input, image grid, filter, download
3. How it works — 3-step visual (Find → Filter → Download)
4. Feature grid — 6 features with icons
5. Free vs Pro comparison table
6. Extension CTAs — Chrome Store + Firefox AMO + Gumroad Pro
7. FAQ accordion (6 questions — see FAQ section below)
8. Footer with internal links

**Internal links from this page**
- → /chrome-extension
- → /firefox-extension
- → /pricing
- → /blog/how-to-bulk-download-images-from-any-website
- → /blog/best-image-downloader-chrome-extensions

---

### 2. Chrome Extension Page — `/chrome-extension`

**Target keyword:** image downloader chrome extension  
**Secondary keywords:** bulk image downloader chrome, ImageMaster chrome, download images chrome extension, chrome image scraper  
**Search intent:** Navigational/download — user wants to install a Chrome extension

**`<title>`**  
`Image Downloader Chrome Extension — ImageMaster | imagedownloader.org`

**Meta description**  
`Install ImageMaster — the best bulk image downloader for Chrome. Download all images from any tab in one click. Filter by size and type. Free + Pro available.`

**`<h1>`**  
`The Best Image Downloader for Chrome`

**Schema markup**  
`SoftwareApplication`

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Image Downloader - ImageMaster",
  "operatingSystem": "Chrome",
  "applicationCategory": "BrowserApplication",
  "offers": [
    {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "name": "Free"
    },
    {
      "@type": "Offer",
      "price": "5.99",
      "priceCurrency": "USD",
      "name": "Pro Lifetime"
    }
  ],
  "url": "https://chromewebstore.google.com/detail/image-downloader-imagemas/hmghdknfmhfbbdedplpdakfbhflfikhm"
}
```

**Page Sections (in order)**
1. Hero — H1, subheadline, Chrome Store install button (primary CTA)
2. Extension screenshots/preview gallery
3. Free feature list
4. Pro feature list with Gumroad CTA ($5.99 promo highlighted)
5. Step-by-step install guide (numbered list — good for featured snippets)
6. Who it's for — designers, developers, marketers, e-commerce sellers, researchers
7. Privacy & security section (no tracking, local processing)
8. FAQ accordion
9. CTA — Chrome Store + Gumroad Pro

**Free features to list**
- One-click bulk download from any tab
- Smart filtering by width, height, file type (PNG, JPG, WEBP, SVG, GIF)
- Image format converter (drag and drop)
- Responsive image gallery preview
- 54 languages supported

**Pro features to list**
- Unlimited downloads (Free limited to 50)
- HD Image Resolvers — Amazon, Twitter/X, Instagram, Pinterest, Shopify, AliExpress
- Download all as ZIP archive
- Auto-Scroll to find lazy-loaded images
- Bulk image conversion (PNG, JPG, WEBP)
- Smart "Select Best" quality filter

**Internal links from this page**
- → / (homepage tool)
- → /firefox-extension
- → /pricing
- → /blog/best-image-downloader-chrome-extensions
- → /blog/how-to-download-images-from-instagram

---

### 3. Firefox Extension Page — `/firefox-extension`

**Target keyword:** image downloader firefox  
**Secondary keywords:** firefox bulk image downloader, firefox image addon, download images firefox extension  
**Search intent:** Navigational/download

**`<title>`**  
`Image Downloader Firefox Extension — Bulk Download Images | imagedownloader.org`

**Meta description**  
`The best bulk image downloader addon for Firefox. Detect, filter, and download all images from any webpage in one click. Free + Pro lifetime license available.`

**`<h1>`**  
`Bulk Image Downloader for Firefox`

**Schema markup**  
`SoftwareApplication` (same structure as Chrome page, operatingSystem: "Firefox")

**Page Sections (in order)**
1. Hero — H1, subheadline, Firefox AMO install button (primary CTA)
2. Extension screenshots
3. Free feature list
4. Pro upgrade section with Gumroad CTA
5. Install guide for Firefox (numbered steps)
6. Privacy section
7. FAQ accordion
8. CTA — AMO install + Gumroad Pro

**Internal links from this page**
- → / (homepage tool)
- → /chrome-extension
- → /pricing
- → /blog/image-downloader-firefox-addon-guide

---

### 4. Pricing Page — `/pricing`

**Target keyword:** image downloader pro lifetime  
**Secondary keywords:** bulk image downloader pro, imagemaster pro price, one time image downloader  
**Search intent:** Commercial — user is ready to buy

**`<title>`**  
`ImageMaster Pro — $5.99 Lifetime License | imagedownloader.org`

**Meta description**  
`Get ImageMaster Pro for just $5.99 — one-time payment, lifetime updates. Unlimited bulk downloads, ZIP export, HD resolvers, and more. Regular price $99.`

**`<h1>`**  
`One Price. Lifetime Access.`

**Schema markup**  
`Product` + `Offer`

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ImageMaster Pro — Bulk Image Downloader",
  "description": "Professional bulk image downloader extension for Chrome and Firefox. Lifetime license with unlimited downloads, ZIP export, HD resolvers, and auto-scroll.",
  "offers": {
    "@type": "Offer",
    "price": "5.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://adshieldpro.gumroad.com/l/rrsgqp"
  }
}
```

**Page Sections (in order)**
1. Hero — H1, promo urgency banner (~~$99~~ → $5.99 limited time)
2. Free vs Pro feature comparison table
3. Pro feature deep-dive — each feature explained in 2–3 sentences
4. Gumroad buy button (large, prominent)
5. What happens after purchase — delivery, install, updates explained
6. Guarantee/refund policy
7. FAQ accordion (purchase-focused questions)
8. Testimonials section (add reviews as they come in)

**Internal links from this page**
- → /chrome-extension
- → /firefox-extension
- → / (free tool)

---

### 5. About Page — `/about`

**Purpose:** E-E-A-T trust signal for Google. Sites without about pages rank lower.

**`<title>`**  
`About imagedownloader.org — Free Bulk Image Downloader Tool`

**Meta description**  
`imagedownloader.org is a free bulk image downloading tool and browser extension built for designers, developers, researchers, and content creators.`

**`<h1>`**  
`About imagedownloader.org`

**Schema markup**  
`Organization`

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "imagedownloader.org",
  "url": "https://imagedownloader.org",
  "email": "admin@imagedownloader.org",
  "description": "Free bulk image downloader tool and browser extension for Chrome and Firefox."
}
```

**Content to include**
- What the tool is and why it was built
- Who it's built by (ConverterWordToPDF Labs)
- What problems it solves
- Privacy commitment (no tracking, local processing)
- Contact: admin@imagedownloader.org
- Links to Chrome Store and Firefox AMO listings

---

### 6. Privacy Policy — `/privacy-policy`

**Required by:** Google Search ranking, Chrome Web Store, Firefox AMO, Gumroad  

**`<title>`**  
`Privacy Policy | imagedownloader.org`

**Content to include**
- What data is collected (none from web tool; payment data handled by Gumroad)
- Local processing declaration — images never leave the user's device
- No browsing history tracked
- No third-party data selling
- Cookie policy (Cloudflare analytics only if used)
- Contact for privacy questions: admin@imagedownloader.org
- Last updated date

---

### 7. Terms of Service — `/terms-of-service`

**Required by:** Chrome Web Store policy, Firefox AMO policy  

**`<title>`**  
`Terms of Service | imagedownloader.org`

**Content to include**
- Acceptable use (personal and commercial use permitted)
- No scraping of protected/paywalled content
- No liability for how images are used after download
- Refund policy (Gumroad handles payments — link to Gumroad refund policy)
- Governing law
- Contact: admin@imagedownloader.org

---

### 8. Contact Page — `/contact`

**`<title>`**  
`Contact Us | imagedownloader.org`

**Meta description**  
`Get in touch with the imagedownloader.org team. Support, feedback, and partnership enquiries welcome.`

**Content to include**
- Email: admin@imagedownloader.org (clickable mailto link)
- Contact form (name, email, message)
- Response time expectation
- Links to Chrome Store reviews and Firefox AMO reviews for public feedback

---

## Blog — Full Plan

### Why the Blog is the #1 SEO Priority

Each blog post targets a specific long-tail search query. Long-tail queries have lower competition, higher purchase intent, and compound over time. Ten well-written posts can outrank established competitors within months.

### Blog Index Page — `/blog`

**`<title>`**  
`Image Downloader Guides & Tips | imagedownloader.org Blog`

**Meta description**  
`Learn how to bulk download images from any website, Instagram, Pinterest, Amazon, and more. Free guides for Chrome and Firefox users.`

---

### Blog Post 1 — `/blog/how-to-bulk-download-images-from-any-website`

**Target keyword:** how to bulk download images from any website  
**Monthly searches:** ~8,000  
**Search intent:** Informational — user wants step-by-step instructions  

**`<title>`**  
`How to Bulk Download Images from Any Website (2026 Guide)`

**Meta description**  
`Step-by-step guide to bulk downloading images from any website. Use our free online tool or install the ImageMaster Chrome and Firefox extension.`

**`<h1>`**  
`How to Bulk Download Images from Any Website`

**Schema:** `HowTo`

**Content outline**
- Introduction — why bulk downloading saves time
- Method 1: Use imagedownloader.org free web tool (step by step)
- Method 2: Use ImageMaster Chrome extension (step by step)
- Method 3: Use ImageMaster Firefox addon (step by step)
- Tips — filter by size and type to get only the images you need
- FAQ — 4 questions
- CTA — link to homepage tool + Chrome Store + Gumroad Pro

**Internal links**
- → / (tool)
- → /chrome-extension
- → /firefox-extension
- → /blog/best-image-downloader-chrome-extensions

---

### Blog Post 2 — `/blog/best-image-downloader-chrome-extensions`

**Target keyword:** best image downloader chrome extension  
**Monthly searches:** ~5,000  
**Search intent:** Commercial — user comparing options before installing  

**`<title>`**  
`5 Best Image Downloader Chrome Extensions in 2026`

**Meta description**  
`Comparing the best bulk image downloader extensions for Chrome in 2026. Features, pricing, and which one is right for you.`

**`<h1>`**  
`Best Image Downloader Chrome Extensions (2026)`

**Schema:** `Article` + `ItemList`

**Content outline**
- Introduction — what to look for in an image downloader extension
- List of 5 extensions (ImageMaster listed first with most detail)
  - ImageMaster (imagedownloader.org)
  - 4 real competitors listed objectively
- Comparison table — features side by side
- Verdict — which is best and why
- CTA → /chrome-extension

**Internal links**
- → /chrome-extension
- → /pricing
- → /blog/how-to-bulk-download-images-from-any-website

---

### Blog Post 3 — `/blog/how-to-download-images-from-instagram`

**Target keyword:** how to download images from instagram  
**Monthly searches:** ~40,000  
**Search intent:** Informational — very high volume  

**`<title>`**  
`How to Download Images from Instagram in Bulk (2026)`

**Meta description**  
`Download images from Instagram easily using ImageMaster's HD Instagram resolver. Get original quality photos in one click with our Chrome or Firefox extension.`

**`<h1>`**  
`How to Download Images from Instagram`

**Schema:** `HowTo`

**Content outline**
- Why Instagram makes it hard to save images
- Method 1: ImageMaster Pro Chrome extension (HD Instagram resolver — gets original source files)
- Method 2: ImageMaster Pro Firefox extension
- Method 3: Right-click workarounds (show limitations vs Pro tool)
- Important note on copyright and personal use
- FAQ — 4 questions
- CTA → /chrome-extension + /pricing (Pro required for Instagram HD)

**Internal links**
- → /chrome-extension
- → /pricing
- → /blog/how-to-download-images-from-pinterest

---

### Blog Post 4 — `/blog/how-to-download-images-from-pinterest`

**Target keyword:** how to download images from pinterest  
**Monthly searches:** ~22,000  

**`<title>`**  
`How to Download Images from Pinterest in Bulk (2026)`

**Meta description**  
`Bulk download Pinterest images in original quality using ImageMaster. Our HD Pinterest resolver fetches source files automatically. Chrome and Firefox supported.`

**`<h1>`**  
`How to Download Pinterest Images in Bulk`

**Schema:** `HowTo`

**Content outline**
- Pinterest image saving limitations
- Using ImageMaster Pro Pinterest resolver
- Step-by-step Chrome extension method
- Step-by-step Firefox addon method
- How to filter by size to skip tiny thumbnails
- Copyright reminder
- FAQ
- CTA → /chrome-extension + /pricing

---

### Blog Post 5 — `/blog/how-to-save-images-from-amazon`

**Target keyword:** how to download images from amazon product page  
**Monthly searches:** ~3,500  
**Search intent:** Commercial — e-commerce sellers and researchers  

**`<title>`**  
`How to Download All Images from an Amazon Product Page`

**Meta description**  
`Download full-resolution Amazon product images in bulk using ImageMaster. Our Amazon HD resolver bypasses thumbnail crops automatically.`

**`<h1>`**  
`How to Download Amazon Product Images in Bulk`

**Schema:** `HowTo`

**Content outline**
- Why Amazon product images are hard to save at full resolution
- How ImageMaster's Amazon HD resolver works
- Step-by-step guide
- Use cases — sellers, researchers, comparison shoppers
- FAQ
- CTA → /chrome-extension + /pricing

---

### Blog Post 6 — `/blog/bulk-download-product-images-ecommerce`

**Target keyword:** bulk download product images ecommerce  
**Monthly searches:** ~2,000  
**Search intent:** Commercial — e-commerce professionals  

**`<title>`**  
`How to Bulk Download Product Images for E-commerce (Amazon, Shopify, AliExpress)`

**Meta description**  
`Download hundreds of product images at once from Amazon, Shopify, and AliExpress using ImageMaster Pro. Save as ZIP. Perfect for e-commerce research.`

**`<h1>`**  
`Bulk Download Product Images for E-commerce`

**Content outline**
- Why e-commerce sellers need bulk image downloading
- Supported platforms — Amazon, Shopify, AliExpress, eBay
- HD resolvers explained per platform
- ZIP download for keeping downloads organized
- Step-by-step guide
- FAQ
- CTA → /pricing

---

### Blog Post 7 — `/blog/image-downloader-firefox-addon-guide`

**Target keyword:** firefox image downloader addon  
**Monthly searches:** ~3,000  

**`<title>`**  
`Best Image Downloader Addon for Firefox — Complete Guide 2026`

**Meta description**  
`How to install and use the best bulk image downloader addon for Firefox. Free version and Pro lifetime license available at imagedownloader.org.`

**`<h1>`**  
`Firefox Image Downloader Addon — Complete Guide`

**Schema:** `HowTo`

**Content outline**
- Why Firefox users need a dedicated image downloader
- Installing the addon from Firefox AMO (step by step)
- Free features walkthrough
- Upgrading to Pro (Gumroad link)
- Pro features walkthrough
- FAQ
- CTA → /firefox-extension + /pricing

---

### Blog Post 8 — `/blog/webp-to-jpg-converter-browser-extension`

**Target keyword:** webp to jpg converter extension  
**Monthly searches:** ~6,000  

**`<title>`**  
`Convert WebP to JPG in Your Browser — Free Chrome & Firefox Extension`

**Meta description**  
`Instantly convert WebP images to JPG or PNG without any software. ImageMaster converts images locally in your browser. Free and Pro versions available.`

**`<h1>`**  
`Convert WebP to JPG with a Browser Extension`

**Content outline**
- What WebP is and why you might need to convert it
- How ImageMaster converts formats locally (no upload, no server)
- Step-by-step: convert WebP to JPG in Chrome
- Step-by-step: convert WebP to JPG in Firefox
- Bulk conversion with Pro version
- Supported formats — WebP, PNG, JPG conversion in all directions
- FAQ
- CTA → /chrome-extension + /firefox-extension

---

### Blog Post 9 — `/blog/best-bulk-image-downloader-2026`

**Target keyword:** best bulk image downloader 2026  
**Monthly searches:** ~4,000  

**`<title>`**  
`Best Bulk Image Downloaders in 2026 — Free & Paid Compared`

**Meta description**  
`The definitive list of the best bulk image downloaders in 2026. Web tools, Chrome extensions, and Firefox addons compared by features and price.`

**`<h1>`**  
`Best Bulk Image Downloaders in 2026`

**Schema:** `Article` + `ItemList`

**Content outline**
- What makes a great bulk image downloader
- Top picks — web tools and extensions
- imagedownloader.org (featured first, most detail)
- Other tools listed objectively
- Comparison table
- Verdict
- CTA → / + /chrome-extension + /pricing

---

### Blog Post 10 — `/blog/how-to-download-images-without-right-clicking`

**Target keyword:** how to download images without right clicking  
**Monthly searches:** ~5,500  

**`<title>`**  
`How to Download Images When Right-Click Is Disabled`

**Meta description**  
`Sites that disable right-clicking can't stop ImageMaster. Learn how to download any image even when right-click save is blocked.`

**`<h1>`**  
`How to Download Images When Right-Click Save Is Disabled`

**Schema:** `HowTo`

**Content outline**
- Why some sites disable right-click
- Why browser extensions bypass this completely
- Step-by-step using ImageMaster Chrome extension
- Step-by-step using ImageMaster Firefox addon
- FAQ
- CTA → /chrome-extension + /firefox-extension

---

### Blog Post 11 — `/blog/image-scraper-for-designers-developers`

**Target keyword:** image scraper for designers  
**Monthly searches:** ~2,500  

**`<title>`**  
`Best Image Scraper for Designers & Developers in 2026`

**Meta description**  
`Extract and download assets from any webpage instantly. ImageMaster is the go-to image scraper for designers, developers, and researchers.`

**`<h1>`**  
`Image Scraper for Designers and Developers`

**Content outline**
- Use cases — UI inspiration, asset extraction, research, machine learning datasets
- How ImageMaster extracts every image including background images and lazy-loaded assets
- Filtering by dimensions to get only high-res assets
- Exporting as ZIP for clean project folders
- FAQ
- CTA → /chrome-extension + /pricing

---

## SEO Metadata Template (Use on Every Page)

```html
<!-- PRIMARY SEO -->
<title>PAGE TITLE HERE — imagedownloader.org</title>
<meta name="description" content="150-160 char description with keyword and CTA." />
<meta name="keywords" content="primary keyword, secondary keyword, tertiary keyword" />
<link rel="canonical" href="https://imagedownloader.org/PAGE-SLUG" />

<!-- OPEN GRAPH (Facebook, LinkedIn sharing) -->
<meta property="og:title" content="PAGE TITLE HERE" />
<meta property="og:description" content="Same as meta description." />
<meta property="og:image" content="https://imagedownloader.org/og/PAGE-SLUG.png" />
<meta property="og:url" content="https://imagedownloader.org/PAGE-SLUG" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="imagedownloader.org" />

<!-- TWITTER CARD -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="PAGE TITLE HERE" />
<meta name="twitter:description" content="Same as meta description." />
<meta name="twitter:image" content="https://imagedownloader.org/og/PAGE-SLUG.png" />

<!-- ROBOTS -->
<meta name="robots" content="index, follow" />
```

---

## Schema Markup Reference

### FAQ Schema (add to every page FAQ section)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is the image downloader free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The web tool at imagedownloader.org is completely free with no limits and no signup required."
      }
    }
  ]
}
```

### HowTo Schema (add to all how-to blog posts)
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Bulk Download Images from Any Website",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Paste the URL",
      "text": "Go to imagedownloader.org and paste the webpage URL into the input box."
    },
    {
      "@type": "HowToStep",
      "name": "Extract images",
      "text": "Click Extract Images to scan the page and load all detected images."
    },
    {
      "@type": "HowToStep",
      "name": "Download",
      "text": "Select the images you want and click Download Selected, or download all at once."
    }
  ]
}
```

### BreadcrumbList Schema (add to every page)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://imagedownloader.org"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://imagedownloader.org/blog"
    }
  ]
}
```

---

## FAQ Bank (Use Across Pages)

These questions target Google featured snippets. Use the most relevant ones per page.

**Tool questions (Homepage, Chrome, Firefox pages)**
- Is the image downloader free?
- Does it work on all websites?
- What image formats does it support?
- How many images can I download at once?
- Do I need to create an account?
- Is my data private?

**Pro/Pricing questions (Pricing page)**
- What is included in ImageMaster Pro?
- How long does the $5.99 promo last?
- What does lifetime updates mean?
- Does Pro work on both Chrome and Firefox?
- How do I receive the extension after purchase?
- What is the refund policy?

**Technical questions (Blog posts)**
- Why can't I right-click to save images on some websites?
- What is a lazy-loaded image?
- What is the difference between WebP and JPG?
- Can I download images from Instagram legally?
- What is an HD image resolver?

---

## Sitemap.xml Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://imagedownloader.org/</loc><priority>1.0</priority></url>
  <url><loc>https://imagedownloader.org/chrome-extension</loc><priority>0.9</priority></url>
  <url><loc>https://imagedownloader.org/firefox-extension</loc><priority>0.9</priority></url>
  <url><loc>https://imagedownloader.org/pricing</loc><priority>0.9</priority></url>
  <url><loc>https://imagedownloader.org/about</loc><priority>0.6</priority></url>
  <url><loc>https://imagedownloader.org/blog</loc><priority>0.8</priority></url>
  <url><loc>https://imagedownloader.org/blog/how-to-bulk-download-images-from-any-website</loc><priority>0.8</priority></url>
  <url><loc>https://imagedownloader.org/blog/best-image-downloader-chrome-extensions</loc><priority>0.8</priority></url>
  <url><loc>https://imagedownloader.org/blog/how-to-download-images-from-instagram</loc><priority>0.8</priority></url>
  <url><loc>https://imagedownloader.org/blog/how-to-download-images-from-pinterest</loc><priority>0.8</priority></url>
  <url><loc>https://imagedownloader.org/blog/how-to-save-images-from-amazon</loc><priority>0.7</priority></url>
  <url><loc>https://imagedownloader.org/blog/bulk-download-product-images-ecommerce</loc><priority>0.7</priority></url>
  <url><loc>https://imagedownloader.org/blog/image-downloader-firefox-addon-guide</loc><priority>0.7</priority></url>
  <url><loc>https://imagedownloader.org/blog/webp-to-jpg-converter-browser-extension</loc><priority>0.7</priority></url>
  <url><loc>https://imagedownloader.org/blog/best-bulk-image-downloader-2026</loc><priority>0.7</priority></url>
  <url><loc>https://imagedownloader.org/blog/how-to-download-images-without-right-clicking</loc><priority>0.7</priority></url>
  <url><loc>https://imagedownloader.org/blog/image-scraper-for-designers-developers</loc><priority>0.7</priority></url>
  <url><loc>https://imagedownloader.org/privacy-policy</loc><priority>0.3</priority></url>
  <url><loc>https://imagedownloader.org/terms-of-service</loc><priority>0.3</priority></url>
  <url><loc>https://imagedownloader.org/contact</loc><priority>0.4</priority></url>
</urlset>
```

---

## robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://imagedownloader.org/sitemap.xml
```

---

## Link Building Strategy (Free)

### Directory Submissions (each = a backlink)
- Product Hunt — launch post on day one
- AlternativeTo.net — list as alternative to popular image downloaders
- SaaSHub — list the Pro extension
- BetaList — submit as a new product
- IndieHackers — share the build story
- GitHub Awesome lists — search "awesome browser extensions" repos and submit a PR

### Community Posts (drives traffic + backlinks)
- Reddit — r/webdev, r/DataHoarder, r/productivity, r/chrome, r/firefox
  - Post title examples: "I built a free bulk image downloader — no signup needed"
  - Answer existing questions about downloading images and link helpfully
- Quora — search "how to download multiple images from a website" and answer with a link
- Stack Overflow — answer developer questions about image scraping and reference the tool

### Content-Based Links
- Write a guest post for a design blog about bulk downloading assets
- Reach out to "tools for designers" roundup articles and ask to be included
- Create a free resource (e.g. a checklist PDF) that other sites will link to

---

## Google Search Console Setup

1. Verify imagedownloader.org via Cloudflare DNS TXT record
2. Submit sitemap.xml immediately after launch
3. Check Coverage report weekly for crawl errors
4. Monitor Performance report for impressions and clicks per keyword
5. Use URL Inspection tool to request indexing on each new page and blog post after publishing

---

## Internal Linking Map

Every page must link to at least 3 other pages. Key links:

| From | To |
|---|---|
| Homepage | /chrome-extension, /firefox-extension, /pricing, /blog/how-to-bulk-download-images |
| Chrome page | /firefox-extension, /pricing, /blog/best-image-downloader-chrome-extensions |
| Firefox page | /chrome-extension, /pricing, /blog/image-downloader-firefox-addon-guide |
| Pricing | /chrome-extension, /firefox-extension, / |
| Every blog post | /, /chrome-extension or /firefox-extension, /pricing, 2 related blog posts |

---

## Key SEO Priorities in Order

1. Homepage with working free tool (done)
2. Privacy Policy and Terms of Service (required before submitting to Google)
3. Chrome extension page
4. Firefox extension page
5. Pricing page
6. About and Contact pages
7. Submit sitemap to Google Search Console
8. Blog post 1 — how to bulk download images from any website
9. Blog post 3 — how to download images from Instagram (highest volume)
10. Blog post 4 — how to download images from Pinterest
11. Blog post 2 — best image downloader chrome extensions
12. All remaining blog posts
13. Directory submissions and community posts for backlinks
