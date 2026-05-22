import { downloadSingle, downloadSelectedAsZip } from './downloader.js';

// Global state
let extractedImages = [];
let selectedUrls = new Set();
let activeFormats = new Set();
let widthFilter = 0;
let heightFilter = 0;
let searchQuery = '';

// DOM Elements
const urlForm = document.getElementById('url-form');
const urlInput = document.getElementById('url-input');
const extractBtn = document.getElementById('extract-btn');
const loader = document.getElementById('loader');
const gridControls = document.getElementById('grid-controls');
const imageGrid = document.getElementById('image-grid');

// Controls
const searchInput = document.getElementById('search-input');
const widthSlider = document.getElementById('width-slider');
const widthValue = document.getElementById('width-value');
const heightSlider = document.getElementById('height-slider');
const heightValue = document.getElementById('height-value');
const formatTagsContainer = document.getElementById('format-tags');

// Stats and Actions
const statsText = document.getElementById('stats-text');
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');
const downloadSelectedBtn = document.getElementById('download-selected-btn');

// Progress Bar Modal
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Mobile Navigation
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

// Initialize events
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  if (urlForm) {
    urlForm.addEventListener('submit', handleExtract);
  }
  setupFilterEvents();
  setupSelectionActions();
  initSmartExtensionBanner();
  personalizeHomepageCTA();
});

// Setup Mobile Menu Toggle
function setupMobileMenu() {
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const spans = menuToggle.querySelectorAll('span');
      if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        // Close dropdown when menu is closed
        const dropdown = navLinks.querySelector('.dropdown');
        if (dropdown) dropdown.classList.remove('open');
      }
    });

    // Mobile click handler for dropdown trigger
    const dropdown = navLinks.querySelector('.dropdown');
    const dropdownTrigger = navLinks.querySelector('.dropdown-trigger');
    if (dropdown && dropdownTrigger) {
      dropdownTrigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('open');
        }
      });
    }
  }
}

// Handle Form Submission / Extract Request
async function handleExtract(e) {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  // UI loading state
  extractBtn.disabled = true;
  loader.style.display = 'flex';
  gridControls.style.display = 'none';
  imageGrid.innerHTML = '';
  
  extractedImages = [];
  selectedUrls.clear();
  activeFormats.clear();

  try {
    const response = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.error) {
      alert(`Error: ${data.error}`);
      loader.style.display = 'none';
      extractBtn.disabled = false;
      return;
    }

    if (!data.images || data.images.length === 0) {
      alert('No images were found on this page.');
      loader.style.display = 'none';
      extractBtn.disabled = false;
      return;
    }

    // Populate global image state
    extractedImages = data.images.map(img => ({
      ...img,
      width: 0,
      height: 0,
      loaded: false
    }));

    // Begin extracting resolution dimensions asynchronously client-side
    preloadDimensions();

    // Show controls and render initially
    gridControls.style.display = 'block';
    setupFormatTags();
    updateFiltersAndRender();

  } catch (error) {
    console.error('Extraction failed:', error);
    alert('Extraction failed. Check console or verify if server is running.');
  } finally {
    loader.style.display = 'none';
    extractBtn.disabled = false;
  }
}

// Asynchronously load images to check dimensions
function preloadDimensions() {
  extractedImages.forEach(img => {
    const tempImg = new Image();
    tempImg.src = img.url;
    tempImg.onload = () => {
      img.width = tempImg.naturalWidth;
      img.height = tempImg.naturalHeight;
      img.loaded = true;
      // Re-trigger render to display new dimensions on cards and adjust filters
      updateFiltersAndRender();
    };
    tempImg.onerror = () => {
      img.width = 0;
      img.height = 0;
      img.loaded = true;
    };
  });
}

// Render dynamic format filtering tags
function setupFormatTags() {
  if (!formatTagsContainer) return;
  formatTagsContainer.innerHTML = '';

  const formats = [...new Set(extractedImages.map(img => img.ext.toUpperCase()))].filter(Boolean);
  
  formats.forEach(format => {
    const tag = document.createElement('span');
    tag.className = 'format-tag';
    tag.textContent = format;
    tag.addEventListener('click', () => {
      if (activeFormats.has(format)) {
        activeFormats.delete(format);
        tag.classList.remove('active');
      } else {
        activeFormats.add(format);
        tag.classList.add('active');
      }
      updateFiltersAndRender();
    });
    formatTagsContainer.appendChild(tag);
  });
}

// Setup Event Listeners for Filters
function setupFilterEvents() {
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      updateFiltersAndRender();
    });
  }

  if (widthSlider && widthValue) {
    widthSlider.addEventListener('input', (e) => {
      widthFilter = parseInt(e.target.value);
      widthValue.textContent = `${widthFilter}px`;
      updateFiltersAndRender();
    });
  }

  if (heightSlider && heightValue) {
    heightSlider.addEventListener('input', (e) => {
      heightFilter = parseInt(e.target.value);
      heightValue.textContent = `${heightFilter}px`;
      updateFiltersAndRender();
    });
  }
}

// Apply filters and render the grid
function updateFiltersAndRender() {
  if (!imageGrid) return;

  // Filter list
  const filtered = extractedImages.filter(img => {
    // 1. Search Query
    const matchesSearch = !searchQuery || 
                          (img.alt && img.alt.toLowerCase().includes(searchQuery)) ||
                          img.url.toLowerCase().includes(searchQuery);

    // 2. Format
    const matchesFormat = activeFormats.size === 0 || activeFormats.has(img.ext.toUpperCase());

    // 3. Size Dimensions (only filter if dimension is loaded)
    const matchesWidth = !img.loaded || img.width >= widthFilter;
    const matchesHeight = !img.loaded || img.height >= heightFilter;

    return matchesSearch && matchesFormat && matchesWidth && matchesHeight;
  });

  // Render cards
  imageGrid.innerHTML = '';
  
  filtered.forEach(img => {
    const card = document.createElement('div');
    card.className = `image-card${selectedUrls.has(img.url) ? ' selected' : ''}`;
    
    // Size text display
    const dimensionText = img.loaded ? `${img.width}x${img.height}` : 'Loading...';
    
    card.innerHTML = `
      <div class="image-card-checkbox"></div>
      <img src="${img.url}" alt="${img.alt || 'Extracted Image'}" loading="lazy">
      <div class="image-card-meta">
        <span>.${img.ext.toUpperCase()}</span>
        <span>${dimensionText}</span>
      </div>
    `;

    // Handle selection toggle
    card.addEventListener('click', (e) => {
      // If clicking directly on a link or button inside card (e.g. download icon), skip toggle
      if (e.target.closest('.download-single-btn')) return;

      if (selectedUrls.has(img.url)) {
        selectedUrls.delete(img.url);
        card.classList.remove('selected');
      } else {
        selectedUrls.add(img.url);
        card.classList.add('selected');
      }
      updateStats(filtered.length);
    });

    // Add individual quick download button in meta
    const metaContainer = card.querySelector('.image-card-meta');
    const downloadIcon = document.createElement('span');
    downloadIcon.className = 'download-single-btn';
    downloadIcon.style.cursor = 'pointer';
    downloadIcon.style.pointerEvents = 'auto';
    downloadIcon.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;
    downloadIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadSingle(img.url, `download.${img.ext}`);
    });
    metaContainer.appendChild(downloadIcon);

    imageGrid.appendChild(card);
  });

  updateStats(filtered.length);
}

// Setup Selection Action Listeners
function setupSelectionActions() {
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      // Add all currently filtered images to selection
      const filtered = getFilteredImages();
      filtered.forEach(img => selectedUrls.add(img.url));
      updateFiltersAndRender();
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      // Remove all currently filtered images from selection
      const filtered = getFilteredImages();
      filtered.forEach(img => selectedUrls.delete(img.url));
      updateFiltersAndRender();
    });
  }

  if (downloadSelectedBtn) {
    downloadSelectedBtn.addEventListener('click', triggerBulkDownload);
  }
}

// Get images that match the active filters
function getFilteredImages() {
  return extractedImages.filter(img => {
    const matchesSearch = !searchQuery || 
                          (img.alt && img.alt.toLowerCase().includes(searchQuery)) ||
                          img.url.toLowerCase().includes(searchQuery);
    const matchesFormat = activeFormats.size === 0 || activeFormats.has(img.ext.toUpperCase());
    const matchesWidth = !img.loaded || img.width >= widthFilter;
    const matchesHeight = !img.loaded || img.height >= heightFilter;
    return matchesSearch && matchesFormat && matchesWidth && matchesHeight;
  });
}

// Update stats bar UI
function updateStats(filteredCount) {
  if (!statsText) return;
  
  const selectedCount = [...selectedUrls].filter(url => 
    extractedImages.some(img => img.url === url)
  ).length;

  statsText.textContent = `Showing ${filteredCount} of ${extractedImages.length} images | ${selectedCount} selected`;

  if (downloadSelectedBtn) {
    downloadSelectedBtn.disabled = selectedCount === 0;
    downloadSelectedBtn.textContent = `Download Selected ZIP (${selectedCount})`;
  }
}

// Handle trigger bulk download zip
async function triggerBulkDownload() {
  // Get details of selected images
  const selectedImages = extractedImages.filter(img => selectedUrls.has(img.url));
  if (selectedImages.length === 0) return;

  // Show progress modal
  if (progressContainer) {
    progressContainer.style.display = 'block';
    updateProgressUI(0, selectedImages.length);
  }

  try {
    await downloadSelectedAsZip(selectedImages, 'imagedownloader_bulk.zip', (completed, total) => {
      updateProgressUI(completed, total);
    });
  } catch (err) {
    alert(`Failed to complete download: ${err.message}`);
  } finally {
    // Hide progress modal after a delay
    setTimeout(() => {
      if (progressContainer) progressContainer.style.display = 'none';
    }, 1500);
  }
}

// Update progress bar helper
function updateProgressUI(completed, total) {
  if (!progressFill || !progressText) return;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `Downloading: ${completed} of ${total} images (${percent}%)`;
}

// Browser Detection & Smart Extension Promotion Banner
function detectBrowser() {
  const ua = navigator.userAgent;
  
  // Edge
  if (/edg/i.test(ua)) return 'edge';
  
  // Opera
  if (/opr|opera/i.test(ua)) return 'opera';
  
  // Brave
  if (navigator.brave && typeof navigator.brave.isBrave === 'function') return 'brave';
  
  // Firefox
  if (/firefox|iceweasel|fxios/i.test(ua)) return 'firefox';
  
  // Chrome
  if (/chrome|crios/i.test(ua) && !/edg/i.test(ua) && !/opr|opera/i.test(ua)) return 'chrome';
  
  // Safari
  if (/safari/i.test(ua) && !/chrome|crios|edg|opr|opera/i.test(ua)) return 'safari';
  
  return 'other';
}

function initSmartExtensionBanner() {
  // Only show on desktop screens
  if (window.innerWidth <= 768) return;

  // Check if dismissed
  if (localStorage.getItem('dismiss-smart-banner') === 'true') return;

  const browser = detectBrowser();
  
  // We only show banner for supported browsers
  if (!['chrome', 'firefox', 'edge', 'brave', 'opera'].includes(browser)) {
    return;
  }

  // Determine store URL & Browser Name
  let storeUrl = '';
  let browserName = '';
  let browserIcon = '';

  if (browser === 'firefox') {
    storeUrl = 'https://addons.mozilla.org/en-US/firefox/addon/bulk-image-download/';
    browserName = 'Firefox';
    browserIcon = '🦊';
  } else {
    storeUrl = 'https://chromewebstore.google.com/detail/image-downloader-imagemas/hmghdknfmhfbbdedplpdakfbhflfikhm';
    if (browser === 'chrome') { browserName = 'Chrome'; browserIcon = '🌐'; }
    else if (browser === 'edge') { browserName = 'Edge'; browserIcon = '🌀'; }
    else if (browser === 'brave') { browserName = 'Brave'; browserIcon = '🦁'; }
    else if (browser === 'opera') { browserName = 'Opera'; browserIcon = '⭕'; }
  }

  // Create Banner Element
  const banner = document.createElement('div');
  banner.className = 'smart-banner';
  banner.innerHTML = `
    <div class="smart-banner-container">
      <div class="smart-banner-text">
        <span class="smart-banner-icon">${browserIcon}</span>
        <span>Install the <strong>ImageMaster Pro</strong> extension for ${browserName} to extract images from protected sites like Instagram, Amazon, and Pinterest.</span>
      </div>
      <a href="${storeUrl}" target="_blank" class="smart-banner-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Install Extension
      </a>
    </div>
    <button class="smart-banner-close" aria-label="Dismiss banner">&times;</button>
  `;

  // Insert banner at the top of the body
  document.body.insertBefore(banner, document.body.firstChild);

  // Setup dismiss event
  const closeBtn = banner.querySelector('.smart-banner-close');
  closeBtn.addEventListener('click', () => {
    banner.classList.add('dismissed');
    localStorage.setItem('dismiss-smart-banner', 'true');
    setTimeout(() => {
      banner.remove();
    }, 300); // match transition duration
  });
}

function personalizeHomepageCTA() {
  const badgeRow = document.querySelector('.badge-row');
  if (!badgeRow) return;

  const browser = detectBrowser();
  if (!['chrome', 'firefox', 'edge', 'brave', 'opera'].includes(browser)) return;

  // Let's create browser-specific primary badges/buttons
  let primaryHTML = '';
  let secondaryHTML = '';
  const proHTML = `<a href="/pricing" class="btn btn-glow">Get Pro Lifetime ($5.99)</a>`;

  if (browser === 'firefox') {
    primaryHTML = `<a href="/firefox-extension" class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%); line-height: 1.5; padding: 12px 24px; border-radius: var(--radius-sm); font-weight: 600;">Get Firefox Addon</a>`;
    secondaryHTML = `<a href="/chrome-extension"><img src="https://developer.chrome.com/static/docs/webstore/brand-guidelines/image/crx-badge-install.png" alt="Install Chrome Extension" style="height: 48px; border-radius: 6px;"></a>`;
  } else if (browser === 'edge') {
    primaryHTML = `<a href="/edge-extension" class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%); line-height: 1.5; padding: 12px 24px; border-radius: var(--radius-sm); font-weight: 600;">Get Edge Extension</a>`;
    secondaryHTML = `<a href="/chrome-extension"><img src="https://developer.chrome.com/static/docs/webstore/brand-guidelines/image/crx-badge-install.png" alt="Install Chrome Extension" style="height: 48px; border-radius: 6px;"></a>`;
  } else if (browser === 'brave') {
    primaryHTML = `<a href="/brave-extension" class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%); line-height: 1.5; padding: 12px 24px; border-radius: var(--radius-sm); font-weight: 600;">Get Brave Extension</a>`;
    secondaryHTML = `<a href="/chrome-extension"><img src="https://developer.chrome.com/static/docs/webstore/brand-guidelines/image/crx-badge-install.png" alt="Install Chrome Extension" style="height: 48px; border-radius: 6px;"></a>`;
  } else if (browser === 'opera') {
    primaryHTML = `<a href="/opera-extension" class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%); line-height: 1.5; padding: 12px 24px; border-radius: var(--radius-sm); font-weight: 600;">Get Opera Extension</a>`;
    secondaryHTML = `<a href="/chrome-extension"><img src="https://developer.chrome.com/static/docs/webstore/brand-guidelines/image/crx-badge-install.png" alt="Install Chrome Extension" style="height: 48px; border-radius: 6px;"></a>`;
  } else {
    // Chrome (default)
    primaryHTML = `<a href="/chrome-extension"><img src="https://developer.chrome.com/static/docs/webstore/brand-guidelines/image/crx-badge-install.png" alt="Install Chrome Extension" style="height: 48px; border-radius: 6px;"></a>`;
    secondaryHTML = `<a href="/firefox-extension" class="btn btn-secondary">Get Firefox Addon</a>`;
  }

  badgeRow.innerHTML = `${primaryHTML}${secondaryHTML}${proHTML}`;
}
