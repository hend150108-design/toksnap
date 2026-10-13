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

  async function processVideo(url) {
    hideNotification();
    setLoadingState(true);

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

      if (!response.ok || !result.success) {
        const errorMsg = result.error || 'Gagal memproses video. Periksa URL Anda dan coba lagi.';
        showNotification('Gagal Memproses Video', errorMsg, 'error');
        return;
      }

      displayResult(result.data);
      showToast('Video berhasil diproses! Silakan pilih format unduhan.');
    } catch (err) {
      showNotification(
        'Koneksi Gagal',
        'Tidak dapat terhubung ke server TokSnap. Pastikan koneksi internet stabil dan coba kembali.',
        'error'
      );
    } finally {
      setLoadingState(false);
    }
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
        optionLink.href = dl.downloadUrl || dl.url;
        optionLink.setAttribute('download', dl.filename);
        optionLink.setAttribute('rel', 'noopener noreferrer');

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

        downloadOptionsContainer.appendChild(optionLink);
      });
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
