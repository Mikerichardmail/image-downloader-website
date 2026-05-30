
/**
 * Downloads a single image using the browser's download prompt.
 * @param {string} url - Absolute image URL
 * @param {string} filename - Desired name of the file
 */
export async function downloadSingle(url, filename) {
  try {
    // Try to fetch as blob to bypass forced navigation or direct image display
    const response = await fetch(url);
    if (!response.ok) throw new Error('CORS or network error');
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    triggerDownload(blobUrl, filename);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    // Fallback: If fetch fails, try fetching through proxy or open in a new tab if everything fails
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    try {
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        triggerDownload(blobUrl, filename);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        return;
      }
    } catch (e) {
      // Final fallback
    }
    // Last resort: standard anchor link (might open in tab instead of downloading)
    triggerDownload(url, filename);
  }
}

/**
 * Trigger browser file save dialog
 */
function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads multiple images in bulk, packs them into a ZIP archive, and downloads it.
 * @param {Array<{url: string, ext: string}>} images - Array of image objects to download
 * @param {string} zipName - Name of the output zip file
 * @param {Function} onProgress - Callback function for progress (completedCount, totalCount)
 */
export async function downloadSelectedAsZip(images, zipName, onProgress) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  let completed = 0;
  const total = images.length;

  const downloadImageAsBlob = async (url) => {
    // Attempt 1: Direct fetch
    try {
      const res = await fetch(url);
      if (res.ok) return await res.blob();
    } catch (e) {
      // Fail-through to proxy
    }

    // Attempt 2: CORS Proxy fallback
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) return await res.blob();
    } catch (e) {
      console.error(`Failed to fetch image: ${url}`, e);
    }
    return null;
  };

  const folderName = zipName.replace(/\.[^/.]+$/, ""); // strip extension if present
  const imgFolder = zip.folder(folderName || "images");

  // Fetch images in chunks of 5 to not hit limits/throttle
  const chunkSize = 5;
  for (let i = 0; i < images.length; i += chunkSize) {
    const chunk = images.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async (img, idx) => {
      const index = i + idx + 1;
      const blob = await downloadImageAsBlob(img.url);
      
      if (blob) {
        // Try to get clean filename
        let filename = `image_${index}`;
        try {
          const urlFilename = img.url.split('/').pop().split('?')[0].split('#')[0];
          if (urlFilename && urlFilename.includes('.')) {
            filename = urlFilename;
          } else {
            filename = `${filename}.${img.ext || 'jpg'}`;
          }
        } catch (err) {
          filename = `${filename}.${img.ext || 'jpg'}`;
        }
        
        imgFolder.file(filename, blob);
      }
      
      completed++;
      if (onProgress) {
        onProgress(completed, total);
      }
    }));
  }

  // Generate the zip and trigger download
  const content = await zip.generateAsync({ type: "blob" });
  const zipUrl = URL.createObjectURL(content);
  triggerDownload(zipUrl, `${folderName || 'images'}.zip`);
  setTimeout(() => URL.revokeObjectURL(zipUrl), 100);
}
