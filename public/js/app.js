/**
 * TokSnap - Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const form = document.getElementById('downloaderForm');
  const urlInput = document.getElementById('tiktokUrl');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitSpinner = document.getElementById('submitSpinner');
  const submitIcon = document.getElementById('submitIcon');
  const dropZoneArea = document.getElementById('dropZoneArea');
  const dragDropNotice = document.getElementById('dragDropNotice');

  const notificationBanner = document.getElementById('notificationBanner');
  const notificationTitle = document.getElementById('notificationTitle');
  const notificationMsg = document.getElementById('notificationMsg');

  const resultSection = document.getElementById('resultSection');
  const resultThumbnail = document.getElementById('resultThumbnail');
  const durationPill = document.getElementById('durationPill');
  const resultAvatar = document.getElementById('resultAvatar');
  const resultAuthorName = document.getElementById('resultAuthorName');
  const resultAuthorHandle = document.getElementById('resultAuthorHandle');
  const resultCaption = document.getElementById('resultCaption');
  const copyCaptionBtn = document.getElementById('copyCaptionBtn');
  const viewsCount = document.getElementById('viewsCount');
  const likesCount = document.getElementById('likesCount');
  const commentsCount = document.getElementById('commentsCount');
  const sharesCount = document.getElementById('sharesCount');
  const downloadOptionsContainer = document.getElementById('downloadOptionsContainer');
  const resetBtn = document.getElementById('resetBtn');

  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  // Video Preview Player Elements
  const thumbnailWrapper = document.getElementById('thumbnailWrapper');
  const playPreviewBtn = document.getElementById('playPreviewBtn');
  const videoPlayerWrapper = document.getElementById('videoPlayerWrapper');
  const previewVideoPlayer = document.getElementById('previewVideoPlayer');
  const closeVideoBtn = document.getElementById('closeVideoBtn');

  let currentPreviewUrl = '';
  let currentDirectVideoUrl = '';
  let isUsingFallback = false;

  // 1. Mobile Menu Toggle
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Input change handlers (Show/Hide Clear Button)
  const updateInputControls = () => {
    if (urlInput.value.trim().length > 0) {
      clearBtn.style.display = 'inline-flex';
    } else {
      clearBtn.style.display = 'none';
    }
  };

  urlInput.addEventListener('input', () => {
    updateInputControls();
    hideNotification();
  });

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    updateInputControls();
    urlInput.focus();
    hideNotification();
  });

  // 4. Drag and Drop Link Handling
  if (dropZoneArea) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZoneArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneArea.classList.add('dragover');
        if (dragDropNotice) dragDropNotice.style.display = 'flex';
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZoneArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneArea.classList.remove('dragover');
        if (dragDropNotice) dragDropNotice.style.display = 'none';
      });
    });

    dropZoneArea.addEventListener('drop', (e) => {
      const droppedText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
      if (droppedText) {
        urlInput.value = droppedText.trim();
        updateInputControls();
        hideNotification();
        urlInput.focus();
        showToast('Link berhasil ditempelkan!');
      }
    });
  }

  // 5. Clipboard Paste
  pasteBtn.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('Clipboard API tidak didukung pada browser ini.');
      }
      const text = await navigator.clipboard.readText();
      if (!text || text.trim() === '') {
        showNotification(
          'Clipboard Kosong',
          'Tidak ada teks yang disalin pada clipboard Anda. Salin tautan video dari TikTok terlebih dahulu.',
          'info'
        );
        return;
      }
      urlInput.value = text.trim();
      updateInputControls();
      hideNotification();
      urlInput.focus();
      showToast('Tautan berhasil ditempelkan dari clipboard!');
    } catch (err) {
      showNotification(
        'Izin Clipboard',
        'Tidak dapat membaca clipboard secara otomatis. Silakan tempel secara manual dengan menekan Ctrl+V (atau ketuk & tahan kolom pada ponsel).',
        'info'
      );
    }
  });

  // 6. Copy Caption
  if (copyCaptionBtn) {
    copyCaptionBtn.addEventListener('click', async () => {
      const text = resultCaption.textContent;
      if (text && text !== '-') {
        try {
          await navigator.clipboard.writeText(text);
          showToast('Deskripsi video berhasil disalin ke clipboard!');
        } catch {
          showToast('Gagal menyalin deskripsi.');
        }
      }
    });
  }

  // 7. Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawUrl = urlInput.value.trim();

    if (!rawUrl) {
      showNotification('Input Kosong', 'Harap masukkan tautan video TikTok terlebih dahulu.', 'error');
      urlInput.focus();
      return;
    }

    // Client-side quick check
    if (!rawUrl.includes('tiktok.com') && !rawUrl.includes('douyin.com')) {
      showNotification(
        'Format URL Tidak Sesuai',
        'URL harus berasal dari tiktok.com (contoh: https://www.tiktok.com/@user/video/123 atau https://vt.tiktok.com/ZS...).',
        'error'
      );
      return;
    }

    await processVideo(rawUrl);
  });

  // 8. Video Player Playback Functions
  function stopAndResetPlayer() {
    if (previewVideoPlayer) {
      previewVideoPlayer.pause();
      previewVideoPlayer.removeAttribute('src');
      previewVideoPlayer.load();
    }
    if (videoPlayerWrapper) videoPlayerWrapper.style.display = 'none';
    if (thumbnailWrapper) thumbnailWrapper.style.display = 'flex';
  }

  function startVideoPlayback() {
    if (!currentPreviewUrl && !currentDirectVideoUrl) {
      showToast('Pratinjau video tidak tersedia untuk diputar.');
      return;
    }

    isUsingFallback = false;
    if (thumbnailWrapper) thumbnailWrapper.style.display = 'none';
    if (videoPlayerWrapper) videoPlayerWrapper.style.display = 'flex';

    const sourceToPlay = currentPreviewUrl || currentDirectVideoUrl;
    previewVideoPlayer.src = sourceToPlay;
    previewVideoPlayer.load();

    const playPromise = previewVideoPlayer.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be blocked by browser policy, user can tap native play control
      });
    }
  }

  if (playPreviewBtn) {
    playPreviewBtn.addEventListener('click', startVideoPlayback);
  }

  if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', () => {
      stopAndResetPlayer();
    });
  }

  if (previewVideoPlayer) {
    // If upstream proxy has a streaming issue, seamlessly fall back to direct link
    previewVideoPlayer.addEventListener('error', () => {
      if (!isUsingFallback && currentDirectVideoUrl && currentDirectVideoUrl !== currentPreviewUrl) {
        console.warn('Proxy streaming error, switching to direct URL fallback...');
        isUsingFallback = true;
        previewVideoPlayer.src = currentDirectVideoUrl;
        previewVideoPlayer.load();
        previewVideoPlayer.play().catch(() => {});
      }
    });
  }

  // 9. Reset Search
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stopAndResetPlayer();
      resultSection.classList.add('hidden');
      urlInput.value = '';
      updateInputControls();
      hideNotification();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      urlInput.focus();
    });
  }

  // 9. FAQ Accordion Toggle
  document.querySelectorAll('.faq-question-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const parentItem = button.closest('.faq-item');
      const isCurrentlyActive = parentItem.classList.contains('active');

      // Close other accordions
      document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('active');
        item.querySelector('.faq-question-btn').setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isCurrentlyActive) {
        parentItem.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Helper Functions
  function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    pasteBtn.disabled = isLoading;
    urlInput.disabled = isLoading;

    if (isLoading) {
      submitBtnText.textContent = 'Memproses...';
      submitSpinner.style.display = 'inline-block';
      submitIcon.style.display = 'none';
    } else {
      submitBtnText.textContent = 'Download Sekarang';
      submitSpinner.style.display = 'none';
      submitIcon.style.display = 'inline-block';
    }
  }

  function showNotification(title, message, type = 'error') {
    notificationBanner.className = `notification-banner notification-${type}`;
    notificationTitle.textContent = title;
    notificationMsg.textContent = message;
    notificationBanner.classList.remove('hidden');
  }

  function hideNotification() {
    notificationBanner.classList.add('hidden');
  }

  function showToast(message) {
    if (!toastNotification) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3200);
  }

  function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString('id-ID');
  }

  function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function normalizeTikwmClientData(json) {
    const data = json.data;
    if (!data) throw new Error('Data video tidak ditemukan dalam respons penyedia.');

    const baseUrl = 'https://www.tikwm.com';
    const normalizeUrl = (link) => {
      if (!link) return null;
      if (link.startsWith('http://') || link.startsWith('https://')) return link;
      return `${baseUrl}${link.startsWith('/') ? '' : '/'}${link}`;
    };

    const videoId = data.id || Date.now().toString();
    const sanitizedTitle = (data.title || 'tiktok_video')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);

    const downloads = [];

    // HD Clean Video (Tanpa Watermark)
    const hdUrl = normalizeUrl(data.hdplay || data.play);
    if (hdUrl) {
      downloads.push({
        id: 'video_hd',
        format: 'mp4',
        label: 'Download Video HD',
        description: 'Kualitas tertinggi tanpa watermark',
        quality: 'HD',
        url: hdUrl,
        downloadUrl: hdUrl,
        filename: `toksnap_${sanitizedTitle}_${videoId}_hd.mp4`
      });
    }

    // Standard Video
    const standardUrl = normalizeUrl(data.play);
    if (standardUrl && standardUrl !== hdUrl) {
      downloads.push({
        id: 'video_sd',
        format: 'mp4',
        label: 'Download Video (SD)',
        description: 'Format standar file lebih hemat data',
        quality: 'SD',
        url: standardUrl,
        downloadUrl: standardUrl,
        filename: `toksnap_${sanitizedTitle}_${videoId}.mp4`
      });
    }

    // Watermarked Video
    const wmUrl = normalizeUrl(data.wmplay);
    if (wmUrl) {
      downloads.push({
        id: 'video_wm',
        format: 'mp4',
        label: 'Download Video (Watermark)',
        description: 'Video asli dengan watermark resmi kreator',
        quality: 'Standard',
        url: wmUrl,
        downloadUrl: wmUrl,
        filename: `toksnap_${sanitizedTitle}_${videoId}_wm.mp4`
      });
    }

    // Audio MP3
    const musicUrl = normalizeUrl(data.music);
    if (musicUrl) {
      downloads.push({
        id: 'audio_mp3',
        format: 'mp3',
        label: 'Download Audio (MP3)',
        description: data.music_info?.title ? `Lagu: ${data.music_info.title}` : 'Ekstrak trek suara MP3 asli',
        quality: '128kbps',
        url: musicUrl,
        downloadUrl: musicUrl,
        filename: `toksnap_${sanitizedTitle}_${videoId}_audio.mp3`
      });
    }

    // Slideshow Photos
    if (Array.isArray(data.images) && data.images.length > 0) {
      data.images.forEach((imgUrl, index) => {
        const normImg = normalizeUrl(imgUrl);
        if (normImg) {
          downloads.push({
            id: `slide_${index + 1}`,
            format: 'jpg',
            label: `Download Slide Foto #${index + 1}`,
            description: `Foto slide resolusi asli`,
            quality: 'HD',
            url: normImg,
            downloadUrl: normImg,
            filename: `toksnap_${sanitizedTitle}_slide_${index + 1}.jpg`
          });
        }
      });
    }

    return {
      id: videoId,
      title: data.title || 'Video TikTok',
      author: {
        name: data.author?.nickname || 'TikTok Creator',
        username: data.author?.unique_id || '',
        avatar: normalizeUrl(data.author?.avatar) || ''
      },
      cover: normalizeUrl(data.cover) || '',
      duration: typeof data.duration === 'number' ? data.duration : null,
      stats: {
        views: data.play_count ?? null,
        likes: data.digg_count ?? null,
        comments: data.comment_count ?? null,
        shares: data.share_count ?? null
      },
      downloads,
      previewUrl: hdUrl || standardUrl,
      directPreviewUrl: hdUrl || standardUrl
    };
  }

  async function resolveViaClientEngine(url) {
    // 1. Direct GET query to TikWM (CORS allowed on browser)
    try {
      const getApiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
      const res = await fetch(getApiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.code === 0 && json.data) {
          return normalizeTikwmClientData(json);
        }
      }
    } catch (e) {
      console.warn('Direct GET resolver failed, trying direct POST fallback...');
    }

    // 2. Direct POST query with form-urlencoded
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('hd', '1');

    const postRes = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json'
      },
      body: formData.toString()
    });

    if (!postRes.ok) {
      throw new Error(`Penyedia layanan mengembalikan status ${postRes.status}.`);
    }

    const postJson = await postRes.json();
    if (!postJson || postJson.code !== 0 || !postJson.data) {
      throw new Error(postJson?.msg || 'Gagal memproses video. Pastikan link video publik dan valid.');
    }

    return normalizeTikwmClientData(postJson);
  }

  async function processVideo(url) {
    hideNotification();
    setLoadingState(true);

    let videoData = null;
    let serverError = null;

    // Phase 1: Try serverless backend
    try {
      const response = await fetch('/api/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      const result = await response.json();
      if (response.ok && result.success && result.data) {
        videoData = result.data;
      } else {
        serverError = result.error || 'Server backend tidak dapat memproses permintaan';
      }
    } catch (err) {
      serverError = err.message || 'Koneksi ke backend serverless terganggu';
    }

    // Phase 2: If serverless is blocked (HTTP 403/502) or down, seamlessly fallback to client engine
    if (!videoData) {
      console.warn('Backend serverless resolve failed (' + serverError + '). Memulai mesin direct client resolver...');
      try {
        videoData = await resolveViaClientEngine(url);
      } catch (clientErr) {
        console.error('Client-side resolve error:', clientErr);
        showNotification(
          'Gagal Memproses Video',
          clientErr.message || serverError || 'Gagal memproses video. Pastikan link video TikTok publik dan valid.',
          'error'
        );
        setLoadingState(false);
        return;
      }
    }

    displayResult(videoData);
    showToast('Video berhasil diproses! Silakan pilih format unduhan.');
    setLoadingState(false);
  }

  async function triggerDirectDownload(e, dl, buttonElement) {
    e.preventDefault();
    const originalText = buttonElement.querySelector('.download-option-title')?.textContent || '';
    const titleEl = buttonElement.querySelector('.download-option-title');
    
    if (titleEl) titleEl.textContent = 'Menyiapkan File...';
    showToast(`Mengunduh: ${dl.filename}`);

    const targetUrl = dl.url || dl.downloadUrl;

    // Method A: Fetch as Blob to force exact filename save on desktop & Android
    try {
      const res = await fetch(targetUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const tempA = document.createElement('a');
        tempA.href = blobUrl;
        tempA.download = dl.filename;
        tempA.style.display = 'none';
        document.body.appendChild(tempA);
        tempA.click();
        document.body.removeChild(tempA);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);

        if (titleEl) titleEl.textContent = originalText;
        showToast('Unduhan berhasil dimulai!');
        return;
      }
    } catch (blobErr) {
      console.log('Blob fetch bypassed due to CORS, continuing with direct download link...');
    }

    // Method B: Direct Anchor click fallback
    const directA = document.createElement('a');
    directA.href = targetUrl;
    directA.download = dl.filename;
    directA.target = '_blank';
    directA.rel = 'noopener noreferrer';
    directA.style.display = 'none';
    document.body.appendChild(directA);
    directA.click();
    document.body.removeChild(directA);

    if (titleEl) titleEl.textContent = originalText;
    showToast('Tautan unduhan dibuka. Periksa bilah unduhan browser Anda!');
  }

  function displayResult(video) {
    // Reset video player state
    stopAndResetPlayer();

    // Cache stream and fallback URLs for playback
    currentPreviewUrl = video.previewUrl || '';
    currentDirectVideoUrl = video.directPreviewUrl || '';

    if (!currentPreviewUrl && Array.isArray(video.downloads)) {
      const mp4Dl = video.downloads.find((d) => d.format === 'mp4');
      if (mp4Dl) {
        currentPreviewUrl = mp4Dl.downloadUrl || mp4Dl.url;
        currentDirectVideoUrl = mp4Dl.url;
      }
    }

    // 1. Thumbnail & duration
    if (video.cover) {
      resultThumbnail.src = video.cover;
      resultThumbnail.alt = video.title || 'Thumbnail TikTok';
      resultThumbnail.style.display = 'block';
    } else {
      resultThumbnail.style.display = 'none';
    }

    const durationText = formatDuration(video.duration);
    if (durationText) {
      durationPill.textContent = durationText;
      durationPill.style.display = 'inline-block';
    } else {
      durationPill.style.display = 'none';
    }

    // 2. Author Details
    resultAuthorName.textContent = video.author?.name || 'TikTok Creator';
    resultAuthorHandle.textContent = video.author?.username ? `@${video.author.username}` : '';
    if (video.author?.avatar) {
      resultAvatar.src = video.author.avatar;
      resultAvatar.style.display = 'block';
    } else {
      resultAvatar.style.display = 'none';
    }

    // 3. Caption / Title
    resultCaption.textContent = video.title || 'Tanpa deskripsi video';

    // 4. Statistics
    viewsCount.textContent = formatNumber(video.stats?.views);
    likesCount.textContent = formatNumber(video.stats?.likes);
    commentsCount.textContent = formatNumber(video.stats?.comments);
    sharesCount.textContent = formatNumber(video.stats?.shares);

    // 5. Download Options
    downloadOptionsContainer.innerHTML = '';

    if (Array.isArray(video.downloads) && video.downloads.length > 0) {
      video.downloads.forEach((dl, index) => {
        const optionLink = document.createElement('a');
        const isPrimary = index === 0;
        optionLink.className = `download-option-btn ${isPrimary ? 'primary-download' : ''}`;
        optionLink.href = dl.url || dl.downloadUrl;
        optionLink.setAttribute('download', dl.filename);
        optionLink.setAttribute('rel', 'noopener noreferrer');
        optionLink.setAttribute('target', '_blank');

        optionLink.innerHTML = `
          <div class="download-option-left">
            <span class="download-format-badge">${dl.format || 'FILE'}</span>
            <div class="download-option-meta">
              <span class="download-option-title">${dl.label}</span>
              <span class="download-option-desc">${dl.description || ''}</span>
            </div>
          </div>
          <div class="download-option-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
        `;

        optionLink.addEventListener('click', (e) => triggerDirectDownload(e, dl, optionLink));
        downloadOptionsContainer.appendChild(optionLink);
      });

      // Add user-friendly tip for mobile browsers
      const tipBox = document.createElement('div');
      tipBox.className = 'download-helper-tip';
      tipBox.style.cssText = 'margin-top: 1rem; padding: 0.85rem 1rem; border-radius: 12px; background: rgba(0,242,254,0.06); border: 1px solid rgba(0,242,254,0.2); font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: flex; gap: 0.5rem; align-items: flex-start;';
      tipBox.innerHTML = `
        <span style="font-size: 1.1rem; flex-shrink: 0;">💡</span>
        <span><strong>Tips Download:</strong> File otomatis terunduh ke perangkat Anda. Jika video terbuka di tab baru pada browser ponsel, ketuk tombol <strong>⋮</strong> (titik tiga) lalu pilih <strong>Download</strong> atau tahan video dan pilih <strong>Simpan Video</strong>.</span>
      `;
      downloadOptionsContainer.appendChild(tipBox);
    } else {
      downloadOptionsContainer.innerHTML = `
        <div style="color: var(--text-secondary); font-size: 0.9rem; padding: 1rem 0;">
          Tidak ada opsi unduhan yang dapat ditemukan untuk video ini.
        </div>
      `;
    }

    // 6. Reveal section and smooth scroll
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
