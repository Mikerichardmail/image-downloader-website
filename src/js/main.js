import { downloadSingle, downloadSelectedAsZip } from './downloader.js';

// Global state
let extractedImages = [];
let selectedUrls = new Set();
let activeFormats = new Set();
let widthFilter = 0;
let heightFilter = 0;
let searchQuery = '';
let cardMap = new Map();

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
  initFloatingAddonPromo();
  initEmailObfuscation();
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

  // Clear any existing error card
  const existingError = document.getElementById('extraction-error-card');
  if (existingError) existingError.remove();

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
      const is403 = data.error.includes('403') || data.error.includes('Forbidden') || data.error.includes('Blocked');
      showExtractionError(data.error, is403);
      loader.style.display = 'none';
      extractBtn.disabled = false;
      return;
    }

    if (!data.images || data.images.length === 0) {
      showExtractionError('No images were found on this page. Some websites load images dynamically or restrict remote scraper access.', false);
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
    renderInitialGrid();
    applyFilters();

    // Trigger promotional prompts safely
    if (isMobile()) {
      setTimeout(() => {
        showPostExtractPromo('toast');
      }, 1500);
    } else {
      showPostExtractPromo('inline');
      setTimeout(() => {
        showPostExtractPromo('toast');
      }, 1000);
    }

  } catch (error) {
    console.error('Extraction failed:', error);
    showExtractionError(error.message || 'Extraction failed. Please verify the URL or check your internet connection.', false);
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
      
      // Update card in-place
      const card = cardMap.get(img.url);
      if (card) {
        const dimSpan = card.querySelector('.dimension-text');
        if (dimSpan) {
          dimSpan.textContent = `${img.width}x${img.height}`;
        }
        
        // Re-evaluate filter for this single card
        const matchesSearch = !searchQuery || 
                              (img.alt && img.alt.toLowerCase().includes(searchQuery)) ||
                              img.url.toLowerCase().includes(searchQuery);
        const matchesFormat = activeFormats.size === 0 || activeFormats.has(img.ext.toUpperCase());
        const matchesWidth = img.width >= widthFilter;
        const matchesHeight = img.height >= heightFilter;
        
        if (matchesSearch && matchesFormat && matchesWidth && matchesHeight) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      }
      
      scheduleStatsUpdate();
    };
    tempImg.onerror = () => {
      img.width = 0;
      img.height = 0;
      img.loaded = true;
      
      const card = cardMap.get(img.url);
      if (card) {
        const dimSpan = card.querySelector('.dimension-text');
        if (dimSpan) {
          dimSpan.textContent = '0x0';
        }
      }
      scheduleStatsUpdate();
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
      applyFilters();
    });
    formatTagsContainer.appendChild(tag);
  });
}

// Setup Event Listeners for Filters
function setupFilterEvents() {
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      applyFilters();
    });
  }

  if (widthSlider && widthValue) {
    widthSlider.addEventListener('input', (e) => {
      widthFilter = parseInt(e.target.value);
      widthValue.textContent = `${widthFilter}px`;
      applyFilters();
    });
  }

  if (heightSlider && heightValue) {
    heightSlider.addEventListener('input', (e) => {
      heightFilter = parseInt(e.target.value);
      heightValue.textContent = `${heightFilter}px`;
      applyFilters();
    });
  }
}

// Render all cards initially inside a DocumentFragment
function renderInitialGrid() {
  if (!imageGrid) return;
  imageGrid.innerHTML = '';
  cardMap.clear();

  const fragment = document.createDocumentFragment();

  extractedImages.forEach(img => {
    const card = document.createElement('div');
    card.className = `image-card${selectedUrls.has(img.url) ? ' selected' : ''}`;

    // Size text display
    const dimensionText = img.loaded ? `${img.width}x${img.height}` : 'Loading...';

    card.innerHTML = `
      <div class="image-card-checkbox"></div>
      <img src="${img.url}" alt="${img.alt || 'Extracted Image'}" loading="lazy">
      <div class="image-card-meta">
        <span>.${img.ext.toUpperCase()}</span>
        <span class="dimension-text">${dimensionText}</span>
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
      updateStats();
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
      
      // High-intent trigger: slide-in toast promotion for desktop
      if (!isMobile()) {
        setTimeout(() => {
          showPostExtractPromo('toast');
        }, 1000);
      }
    });
    metaContainer.appendChild(downloadIcon);

    fragment.appendChild(card);
    cardMap.set(img.url, card);
  });

  imageGrid.appendChild(fragment);
}

// Update card visibility in-place based on active filters
function applyFilters() {
  if (!imageGrid) return;

  extractedImages.forEach(img => {
    const card = cardMap.get(img.url);
    if (!card) return;

    // 1. Search Query
    const matchesSearch = !searchQuery || 
                          (img.alt && img.alt.toLowerCase().includes(searchQuery)) ||
                          img.url.toLowerCase().includes(searchQuery);

    // 2. Format
    const matchesFormat = activeFormats.size === 0 || activeFormats.has(img.ext.toUpperCase());

    // 3. Size Dimensions (only filter if dimension is loaded)
    const matchesWidth = !img.loaded || img.width >= widthFilter;
    const matchesHeight = !img.loaded || img.height >= heightFilter;

    const matchesAll = matchesSearch && matchesFormat && matchesWidth && matchesHeight;

    if (matchesAll) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });

  updateStats();
}

let statsUpdateTimeout = null;
function scheduleStatsUpdate() {
  if (statsUpdateTimeout) return;
  statsUpdateTimeout = requestAnimationFrame(() => {
    updateStats();
    statsUpdateTimeout = null;
  });
}

// Setup Selection Action Listeners
function setupSelectionActions() {
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      // Add all currently filtered images to selection
      const filtered = getFilteredImages();
      filtered.forEach(img => {
        selectedUrls.add(img.url);
        const card = cardMap.get(img.url);
        if (card) {
          card.classList.add('selected');
        }
      });
      updateStats();
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      // Remove all currently filtered images from selection
      const filtered = getFilteredImages();
      filtered.forEach(img => {
        selectedUrls.delete(img.url);
        const card = cardMap.get(img.url);
        if (card) {
          card.classList.remove('selected');
        }
      });
      updateStats();
    });
  }

  if (downloadSelectedBtn) {
    downloadSelectedBtn.addEventListener('click', triggerBulkDownload);
  }
}

// Get images that match the active filters
function getFilteredImages() {
  return extractedImages.filter(img => {
    const card = cardMap.get(img.url);
    return card && card.style.display !== 'none';
  });
}

// Update stats bar UI
function updateStats() {
  if (!statsText) return;
  
  let visibleCount = 0;
  cardMap.forEach(card => {
    if (card.style.display !== 'none') {
      visibleCount++;
    }
  });

  const selectedCount = [...selectedUrls].filter(url => 
    extractedImages.some(img => img.url === url)
  ).length;

  statsText.textContent = `Showing ${visibleCount} of ${extractedImages.length} images | ${selectedCount} selected`;

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

  // High-intent trigger: slide-in toast promotion for desktop
  if (!isMobile()) {
    setTimeout(() => {
      showPostExtractPromo('toast');
    }, 1000);
  }

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

// Check if mobile device viewport
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Get browser's original brand SVG icon from official/Wikimedia CDN
function getBrowserIcon(browser, isMobileView) {
  if (isMobileView) {
    return `<img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Smartphone_Icon.svg" class="promo-icon-img mobile" alt="Mobile">`;
  }
  
  if (browser === 'firefox') {
    return `<img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg" class="promo-icon-img firefox" alt="Firefox">`;
  }
  
  if (browser === 'edge') {
    return `<img src="https://upload.wikimedia.org/wikipedia/commons/f/f6/Edge_Logo_2019.svg" class="promo-icon-img edge" alt="Edge">`;
  }
  
  if (browser === 'chrome') {
    return `<img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" class="promo-icon-img chrome" alt="Chrome">`;
  }
  
  if (browser === 'brave') {
    return `<img src="https://upload.wikimedia.org/wikipedia/commons/9/9d/Brave-logo-color.svg" class="promo-icon-img brave" alt="Brave">`;
  }
  
  if (browser === 'opera') {
    return `<img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Opera_O.svg" class="promo-icon-img opera" alt="Opera">`;
  }

  // Generic/Safari logo fallback
  return `<img src="https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg" class="promo-icon-img safari" alt="Safari">`;
}

// Show Post Extraction Promotion (either Inline banner or Slide-in Toast)
function showPostExtractPromo(layoutType) {
  // Check if dismissed
  if (localStorage.getItem(`dismiss-post-extract-${layoutType}`) === 'true') {
    return;
  }

  // Prevent duplicate rendering
  if (document.querySelector(`.post-extract-promo-${layoutType}`)) {
    return;
  }

  const mobileMode = isMobile();
  const browser = detectBrowser();

  // If mobileMode and layoutType is 'inline', skip it (mobile only uses toast bottom sheets)
  if (mobileMode && layoutType === 'inline') {
    return;
  }

  // Determine browser extension store details
  let storeUrl = '';
  let browserName = '';

  if (browser === 'firefox') {
    storeUrl = 'https://addons.mozilla.org/en-US/firefox/addon/bulk-image-download/';
    browserName = 'Firefox';
  } else if (browser === 'edge') {
    storeUrl = 'https://microsoftedge.microsoft.com/addons/detail/bulk-image-downloader-and/klankjlbkmmhpnldkckiaifbmnpafpfg';
    browserName = 'Edge';
  } else if (browser === 'chrome' || browser === 'brave' || browser === 'opera') {
    storeUrl = 'https://chromewebstore.google.com/detail/image-downloader-imagemas/hmghdknfmhfbbdedplpdakfbhflfikhm';
    if (browser === 'chrome') { browserName = 'Chrome'; }
    else if (browser === 'brave') { browserName = 'Brave'; }
    else if (browser === 'opera') { browserName = 'Opera'; }
  }

  const browserIconHTML = getBrowserIcon(browser, mobileMode);

  // Create card element
  const card = document.createElement('div');
  card.className = `post-extract-promo-${layoutType}`;

  let htmlContent = '';

  if (mobileMode) {
    // Mobile bottom sheet layout
    htmlContent = `
      <div class="promo-card-content">
        <div class="promo-card-icon">${browserIconHTML}</div>
        <div class="promo-card-details">
          <div class="promo-card-title">Extraction Successful!</div>
          <div class="promo-card-desc">Since mobile browsers don't support desktop extensions, bookmark this page or <strong>Add to Home Screen</strong> for instant access.</div>
        </div>
      </div>
      <div class="promo-card-actions">
        <div class="promo-dont-show-container">
          <input type="checkbox" id="dont-show-${layoutType}">
          <label for="dont-show-${layoutType}">Don't show again</label>
        </div>
        <a href="/pricing" class="promo-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Get Pro Lifetime
        </a>
      </div>
      <button class="promo-close" aria-label="Dismiss">&times;</button>
    `;
  } else {
    // Desktop View Card Layout
    if (storeUrl) {
      htmlContent = `
        <div class="promo-card-content">
          <div class="promo-card-icon">${browserIconHTML}</div>
          <div class="promo-card-details">
            <div class="promo-card-title">Get <span>ImageMaster Pro</span> for ${browserName}</div>
            <div class="promo-card-desc">Extract from protected sites (Instagram, Amazon) and auto-scroll lazy images with our free extension.</div>
          </div>
        </div>
        <div class="promo-card-actions">
          <div class="promo-dont-show-container">
            <input type="checkbox" id="dont-show-${layoutType}">
            <label for="dont-show-${layoutType}">Don't show again</label>
          </div>
          <a href="${storeUrl}" target="_blank" class="promo-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Add Extension
          </a>
        </div>
        <button class="promo-close" aria-label="Dismiss">&times;</button>
      `;
    } else {
      // Safari or other desktop browsers
      htmlContent = `
        <div class="promo-card-content">
          <div class="promo-card-icon">${browserIconHTML}</div>
          <div class="promo-card-details">
            <div class="promo-card-title">Want more power?</div>
            <div class="promo-card-desc">Bypass site blockages and auto-scroll feeds. Try our Chrome or Firefox extensions on desktop!</div>
          </div>
        </div>
        <div class="promo-card-actions">
          <div class="promo-dont-show-container">
            <input type="checkbox" id="dont-show-${layoutType}">
            <label for="dont-show-${layoutType}">Don't show again</label>
          </div>
          <a href="/chrome-extension" class="promo-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Learn More
          </a>
        </div>
        <button class="promo-close" aria-label="Dismiss">&times;</button>
      `;
    }
  }

  card.innerHTML = htmlContent;

  // Append to correct DOM position depending on layoutType
  if (layoutType === 'inline') {
    const gridControls = document.getElementById('grid-controls');
    if (gridControls) {
      gridControls.insertBefore(card, gridControls.firstChild);
    }
  } else if (layoutType === 'toast') {
    document.body.appendChild(card);
    // Trigger slide-in animation reflow
    setTimeout(() => {
      card.classList.add('active');
    }, 100);
  }

  // Setup dismiss events
  const closeBtn = card.querySelector('.promo-close');
  const checkbox = card.querySelector(`#dont-show-${layoutType}`);

  const dismissPromo = () => {
    if (checkbox && checkbox.checked) {
      localStorage.setItem(`dismiss-post-extract-${layoutType}`, 'true');
    }
    
    if (layoutType === 'toast') {
      card.classList.remove('active');
      setTimeout(() => {
        card.remove();
      }, 500);
    } else {
      card.style.opacity = '0';
      card.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        card.remove();
      }, 300);
    }
  };

  closeBtn.addEventListener('click', dismissPromo);
  
  const actionBtn = card.querySelector('.promo-btn');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      localStorage.setItem(`dismiss-post-extract-${layoutType}`, 'true');
      setTimeout(dismissPromo, 1000);
    });
  }
}

// Show interactive, informative error notifications
function showExtractionError(message, is403OrBlocked = true) {
  // If there's an existing error, remove it
  const existingError = document.getElementById('extraction-error-card');
  if (existingError) existingError.remove();

  const urlForm = document.getElementById('url-form');
  if (!urlForm) return;

  const errorCard = document.createElement('div');
  errorCard.id = 'extraction-error-card';
  errorCard.className = 'error-card';

  const browser = detectBrowser();
  let extensionLinkHTML = '';

  let storeUrl = '';
  let browserName = '';
  if (browser === 'firefox') {
    storeUrl = 'https://addons.mozilla.org/en-US/firefox/addon/bulk-image-download/';
    browserName = 'Firefox';
  } else if (browser === 'edge') {
    storeUrl = 'https://microsoftedge.microsoft.com/addons/detail/bulk-image-downloader-and/klankjlbkmmhpnldkckiaifbmnpafpfg';
    browserName = 'Edge';
  } else if (['chrome', 'brave', 'opera'].includes(browser)) {
    storeUrl = 'https://chromewebstore.google.com/detail/image-downloader-imagemas/hmghdknfmhfbbdedplpdakfbhflfikhm';
    browserName = browser === 'chrome' ? 'Chrome' : browser === 'brave' ? 'Brave' : 'Opera';
  }

  if (storeUrl && !isMobile()) {
    extensionLinkHTML = `
      <div class="error-solution">
        <p><strong>Bypass extraction blocks instantly:</strong> Use our free browser extension to extract and download images directly from your browser tab without restrictions.</p>
        <a href="${storeUrl}" target="_blank" class="promo-btn" style="margin-top: 10px; font-size: 0.85rem; padding: 10px 22px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Install for ${browserName}
        </a>
      </div>
    `;
  } else if (isMobile()) {
    extensionLinkHTML = `
      <div class="error-solution">
        <p><strong>Mobile Viewport Limit:</strong> Many sites block automated remote fetches. For full extraction, try using our extension on a desktop browser.</p>
      </div>
    `;
  }

  errorCard.innerHTML = `
    <div class="error-card-header">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <strong>Extraction Failed / Blocked</strong>
    </div>
    <div class="error-card-body">
      <p class="error-desc">${message}</p>
      ${extensionLinkHTML}
    </div>
    <button class="error-card-close" aria-label="Dismiss">&times;</button>
  `;

  // Insert immediately after the form
  urlForm.parentNode.insertBefore(errorCard, urlForm.nextSibling);

  // Setup dismiss event
  const closeBtn = errorCard.querySelector('.error-card-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      errorCard.style.opacity = '0';
      errorCard.style.transition = 'opacity 0.2s ease';
      setTimeout(() => {
        errorCard.remove();
      }, 200);
    });
  }
}

function initSmartExtensionBanner() {
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
  } else if (browser === 'edge') {
    storeUrl = 'https://microsoftedge.microsoft.com/addons/detail/bulk-image-downloader-and/klankjlbkmmhpnldkckiaifbmnpafpfg';
    browserName = 'Edge';
    browserIcon = '🌀';
  } else {
    storeUrl = 'https://chromewebstore.google.com/detail/image-downloader-imagemas/hmghdknfmhfbbdedplpdakfbhflfikhm';
    if (browser === 'chrome') { browserName = 'Chrome'; browserIcon = '🌐'; }
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
    secondaryHTML = `<a href="/chrome-extension"><img src="/src/images/crx-badge-install.png" alt="Install Chrome Extension" width="170" height="48" style="height: 48px; border-radius: 6px;"></a>`;
  } else if (browser === 'edge') {
    primaryHTML = `<a href="/edge-extension" class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%); line-height: 1.5; padding: 12px 24px; border-radius: var(--radius-sm); font-weight: 600;">Get Edge Extension</a>`;
    secondaryHTML = `<a href="/chrome-extension"><img src="/src/images/crx-badge-install.png" alt="Install Chrome Extension" width="170" height="48" style="height: 48px; border-radius: 6px;"></a>`;
  } else if (browser === 'brave') {
    primaryHTML = `<a href="/brave-extension" class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%); line-height: 1.5; padding: 12px 24px; border-radius: var(--radius-sm); font-weight: 600;">Get Brave Extension</a>`;
    secondaryHTML = `<a href="/chrome-extension"><img src="/src/images/crx-badge-install.png" alt="Install Chrome Extension" width="170" height="48" style="height: 48px; border-radius: 6px;"></a>`;
  } else if (browser === 'opera') {
    primaryHTML = `<a href="/opera-extension" class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%); line-height: 1.5; padding: 12px 24px; border-radius: var(--radius-sm); font-weight: 600;">Get Opera Extension</a>`;
    secondaryHTML = `<a href="/chrome-extension"><img src="/src/images/crx-badge-install.png" alt="Install Chrome Extension" width="170" height="48" style="height: 48px; border-radius: 6px;"></a>`;
  } else {
    // Chrome (default)
    primaryHTML = `<a href="/chrome-extension"><img src="/src/images/crx-badge-install.png" alt="Install Chrome Extension" width="170" height="48" style="height: 48px; border-radius: 6px;"></a>`;
    secondaryHTML = `<a href="/firefox-extension" class="btn btn-secondary">Get Firefox Addon</a>`;
  }

  badgeRow.innerHTML = `${primaryHTML}${secondaryHTML}${proHTML}`;
}

function initFloatingAddonPromo() {
  // Check if already dismissed
  if (localStorage.getItem('dismiss-floating-addon-promo') === 'true') return;

  const browser = detectBrowser();
  
  // We want to target supported browsers
  if (!['chrome', 'firefox', 'edge', 'brave', 'opera'].includes(browser)) {
    return;
  }

  // Determine store URL & Browser Name
  let storeUrl = '';
  let browserName = '';
  if (browser === 'firefox') {
    storeUrl = 'https://addons.mozilla.org/en-US/firefox/addon/bulk-image-download/';
    browserName = 'Firefox';
  } else if (browser === 'edge') {
    storeUrl = 'https://microsoftedge.microsoft.com/addons/detail/bulk-image-downloader-and/klankjlbkmmhpnldkckiaifbmnpafpfg';
    browserName = 'Edge';
  } else {
    storeUrl = 'https://chromewebstore.google.com/detail/image-downloader-imagemas/hmghdknfmhfbbdedplpdakfbhflfikhm';
    if (browser === 'chrome') browserName = 'Chrome';
    else if (browser === 'brave') browserName = 'Brave';
    else if (browser === 'opera') browserName = 'Opera';
  }

  const browserIconHTML = getBrowserIcon(browser, false);

  // Create Popup Element
  const promoCard = document.createElement('div');
  promoCard.className = 'addon-promo-floating-card';
  promoCard.id = 'addon-promo-card';
  
  promoCard.innerHTML = `
    <button class="addon-promo-close-btn" id="addon-promo-close" aria-label="Close">&times;</button>
    <div class="addon-promo-body">
      <div class="addon-promo-icon-container">
        ${browserIconHTML}
      </div>
      <div class="addon-promo-info">
        <h4 class="addon-promo-title">Add <span>ImageMaster Pro</span> to ${browserName}</h4>
        <p class="addon-promo-desc">Extract images behind logins, download files from private portals, and auto-scroll pages to trigger lazy-loading.</p>
      </div>
    </div>
    <div class="addon-promo-footer">
      <button class="addon-promo-btn-secondary" id="addon-promo-dismiss">Maybe Later</button>
      <a href="${storeUrl}" target="_blank" class="btn btn-glow addon-promo-btn-primary" id="addon-promo-download-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download for ${browserName}
      </a>
    </div>
  `;

  document.body.appendChild(promoCard);

  // Smooth slide-in after 2 seconds
  setTimeout(() => {
    promoCard.classList.add('active');
  }, 2000);

  // Setup event listeners
  const closeBtn = promoCard.querySelector('#addon-promo-close');
  const dismissBtn = promoCard.querySelector('#addon-promo-dismiss');
  const downloadBtn = promoCard.querySelector('#addon-promo-download-btn');

  const dismissPromo = () => {
    promoCard.classList.remove('active');
    localStorage.setItem('dismiss-floating-addon-promo', 'true');
    setTimeout(() => {
      promoCard.remove();
    }, 500);
  };

  closeBtn.addEventListener('click', dismissPromo);
  dismissBtn.addEventListener('click', dismissPromo);
  downloadBtn.addEventListener('click', dismissPromo);
}

// Obfuscated email decoder to protect contact details from scraper bots
function initEmailObfuscation() {
  document.querySelectorAll('.email-obfuscated').forEach(el => {
    const name = el.getAttribute('data-name');
    const domain = el.getAttribute('data-domain');
    const tld = el.getAttribute('data-tld');
    if (name && domain && tld) {
      const email = `${name}@${domain}.${tld}`;
      el.setAttribute('href', `mailto:${email}`);
      if (el.textContent.includes('[at]')) {
        el.textContent = email;
      }
    }
  });
}
