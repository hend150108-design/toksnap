/**
 * TokSnap - Frontend Application Logic
 * Supports Sequential Navigation Tracking & Multi-Language Switching
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

  // Language Dropdown References
  const langDropdownBtn = document.getElementById('langDropdownBtn');
  const langDropdownMenu = document.getElementById('langDropdownMenu');
  const langDropdownList = document.getElementById('langDropdownList');
  const mobileLangGrid = document.getElementById('mobileLangGrid');

  // Video Preview Player Elements
  const thumbnailWrapper = document.getElementById('thumbnailWrapper');
  const playPreviewBtn = document.getElementById('playPreviewBtn');
  const videoPlayerWrapper = document.getElementById('videoPlayerWrapper');
  const previewVideoPlayer = document.getElementById('previewVideoPlayer');
  const closeVideoBtn = document.getElementById('closeVideoBtn');

  let currentPreviewUrl = '';
  let currentDirectVideoUrl = '';
  let isUsingFallback = false;
  let lastVideoData = null;

  // Translation helper
  const translate = (key, fallback = '') => {
    if (window.toksnapI18n && typeof window.toksnapI18n.t === 'function') {
      return window.toksnapI18n.t(key, fallback);
    }
    return fallback || key;
  };

  // 1. Mobile Menu Toggle
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        closeLanguageDropdown();
      }
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Multi-Language Switcher (Indonesian & English) Dropdown & Mobile Chips
  function initLanguageDropdown() {
    if (!window.toksnapI18n) return;

    // Trigger full translation pass to ensure all elements reflect the saved language
    if (typeof window.toksnapI18n.init === 'function') {
      window.toksnapI18n.init();
    }

    const languages = window.toksnapI18n.languages;
    const currentLang = window.toksnapI18n.getCurrentLanguage();
    const langInfo = window.toksnapI18n.getLanguageInfo(currentLang);

    // Sync header button flag & country code immediately
    const currentFlagEl = document.getElementById('currentLangFlag');
    const currentCodeEl = document.getElementById('currentLangCode');
    if (currentFlagEl && langInfo) currentFlagEl.textContent = langInfo.flag;
    if (currentCodeEl && langInfo) currentCodeEl.textContent = langInfo.country;

    // Populate Desktop Dropdown Menu
    if (langDropdownList) {
      langDropdownList.innerHTML = '';
      languages.forEach((lang) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `lang-item-btn ${lang.code === currentLang ? 'active' : ''}`;
        btn.setAttribute('data-lang', lang.code);
        btn.setAttribute('role', 'menuitem');
        btn.setAttribute('aria-selected', String(lang.code === currentLang));

        btn.innerHTML = `
          <div class="lang-item-content">
            <span class="lang-item-flag">${lang.flag}</span>
            <span class="lang-item-name">${lang.name}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.45rem;">
            <span class="lang-item-code">${lang.country}</span>
            <span class="lang-check-icon" style="visibility: ${lang.code === currentLang ? 'visible' : 'hidden'}">✓</span>
          </div>
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.toksnapI18n.setLanguage(lang.code);
          closeLanguageDropdown();
          if (navMenu) navMenu.classList.remove('open');
          if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
        });

        langDropdownList.appendChild(btn);
      });
    }

    // Populate Mobile Grid Chips
    if (mobileLangGrid) {
      mobileLangGrid.innerHTML = '';
      languages.forEach((lang) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `mobile-lang-chip ${lang.code === currentLang ? 'active' : ''}`;
        chip.setAttribute('data-lang', lang.code);
        chip.innerHTML = `<span>${lang.flag}</span> <span>${lang.nativeName}</span>`;
        chip.title = lang.name;

        chip.addEventListener('click', () => {
          window.toksnapI18n.setLanguage(lang.code);
          if (navMenu) navMenu.classList.remove('open');
          if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
        });

        mobileLangGrid.appendChild(chip);
      });
    }

    // Dropdown toggle logic
    if (langDropdownBtn && langDropdownMenu) {
      langDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = langDropdownMenu.classList.toggle('show');
        langDropdownBtn.setAttribute('aria-expanded', String(isOpen));
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#langSelectorDropdown')) {
          closeLanguageDropdown();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeLanguageDropdown();
        }
      });
    }
  }

  function closeLanguageDropdown() {
    if (langDropdownMenu) langDropdownMenu.classList.remove('show');
    if (langDropdownBtn) langDropdownBtn.setAttribute('aria-expanded', 'false');
  }

  // Listen for language changes to update active result card elements dynamically
  window.addEventListener('toksnap:languageChanged', (e) => {
    const lang = e.detail?.lang || (window.toksnapI18n ? window.toksnapI18n.getCurrentLanguage() : 'id');
    const langInfo = e.detail?.langInfo || (window.toksnapI18n ? window.toksnapI18n.getLanguageInfo(lang) : null);

    const currentFlagEl = document.getElementById('currentLangFlag');
    const currentCodeEl = document.getElementById('currentLangCode');
    if (currentFlagEl && langInfo) currentFlagEl.textContent = langInfo.flag;
    if (currentCodeEl && langInfo) currentCodeEl.textContent = langInfo.country;

    // Synchronize active states in dropdown
    document.querySelectorAll('.lang-item-btn').forEach((btn) => {
      const isMatch = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', String(isMatch));
      const check = btn.querySelector('.lang-check-icon');
      if (check) check.style.visibility = isMatch ? 'visible' : 'hidden';
    });

    // Synchronize mobile chips
    document.querySelectorAll('.mobile-lang-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.getAttribute('data-lang') === lang);
    });

    // Re-render result download buttons if currently shown
    if (lastVideoData && resultSection && !resultSection.classList.contains('hidden')) {
      displayResult(lastVideoData);
    }
  });

  // Initialize Language Switcher
  initLanguageDropdown();

  // 3. Sequential Navigation Tracking (ScrollSpy 01 -> 05)
  const navLinks = document.querySelectorAll('.nav-link[data-nav-target]');
  const sectionIds = ['beranda', 'cara-penggunaan', 'keunggulan', 'faq', 'tentang'];

  function updateActiveNavLink(targetId) {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute('data-nav-target') === targetId;
      link.classList.toggle('active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('data-nav-target');
      if (targetId) {
        updateActiveNavLink(targetId);
      }
      if (navMenu) navMenu.classList.remove('open');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0, 0.2]
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateActiveNavLink(entry.target.id);
        }
      });
    }, observerOptions);

    sectionIds.forEach((id) => {
      const sectionEl = document.getElementById(id);
      if (sectionEl) sectionObserver.observe(sectionEl);
    });
  }

  // 4. Input change handlers (Show/Hide Clear Button)
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

  // 5. Drag and Drop Link Handling
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
        showToast(translate('toast_link_copied', 'Link berhasil ditempelkan!'));
      }
    });
  }

  // 6. Clipboard Paste
  pasteBtn.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('Clipboard API tidak didukung pada browser ini.');
      }
      const text = await navigator.clipboard.readText();
      if (!text || text.trim() === '') {
        showNotification(
          'Clipboard Kosong',
          translate('err_empty_url', 'Tidak ada teks pada clipboard. Salin tautan video dari TikTok terlebih dahulu.'),
          'info'
        );
        return;
      }
      urlInput.value = text.trim();
      updateInputControls();
      hideNotification();
      urlInput.focus();
      showToast(translate('toast_link_copied', 'Tautan berhasil ditempelkan!'));
    } catch (err) {
      showNotification(
        'Izin Clipboard',
        'Tidak dapat membaca clipboard secara otomatis. Silakan tempel secara manual dengan menekan Ctrl+V (atau ketuk & tahan kolom pada ponsel).',
        'info'
      );
    }
  });

  // 7. Copy Caption
  if (copyCaptionBtn) {
    copyCaptionBtn.addEventListener('click', async () => {
      const text = resultCaption.textContent;
      if (text && text !== '-') {
        try {
          await navigator.clipboard.writeText(text);
          showToast(translate('toast_caption_copied', 'Deskripsi video berhasil disalin ke clipboard!'));
        } catch {
          showToast(translate('toast_copy_failed', 'Gagal menyalin deskripsi.'));
        }
      }
    });
  }

  // 8. Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawUrl = urlInput.value.trim();

    if (!rawUrl) {
      showNotification(
        translate('err_title_empty', 'Input Kosong'),
        translate('err_empty_url', 'Harap masukkan tautan video TikTok terlebih dahulu.'),
        'error'
      );
      urlInput.focus();
      return;
    }

    // Client-side quick check
    if (!rawUrl.includes('tiktok.com') && !rawUrl.includes('douyin.com')) {
      showNotification(
        translate('err_title_invalid', 'Format URL Tidak Sesuai'),
        translate('err_invalid_url', 'URL harus berasal dari tiktok.com (contoh: https://www.tiktok.com/@user/video/123 atau https://vt.tiktok.com/ZS...).'),
        'error'
      );
      return;
    }

    await processVideo(rawUrl);
  });

  // 9. Video Player Playback Functions
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
      showToast(translate('no_options_found', 'Pratinjau video tidak tersedia untuk diputar.'));
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
        // Autoplay handled by native user tap
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

  // 10. Reset Search
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stopAndResetPlayer();
      lastVideoData = null;
      resultSection.classList.add('hidden');
      urlInput.value = '';
      updateInputControls();
      hideNotification();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      urlInput.focus();
    });
  }

  // 11. FAQ Accordion Toggle
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
      submitBtnText.textContent = translate('btn_downloading', 'Memproses...');
      submitSpinner.style.display = 'inline-block';
      submitIcon.style.display = 'none';
    } else {
      submitBtnText.textContent = translate('btn_download', 'Download Sekarang');
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
    const lang = window.toksnapI18n ? window.toksnapI18n.getCurrentLanguage() : 'id';
    return num.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US');
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

      const result = await response.json().catch(() => null);

      if (response.ok && result && result.success && result.data) {
        lastVideoData = result.data;
        displayResult(result.data);
        showToast(translate('toast_processed_success', 'Video berhasil diproses! Silakan pilih format unduhan.'));
      } else {
        const errorMsg = result?.error || `Server merespons dengan status ${response.status}. Pastikan link video TikTok publik dan valid.`;
        showNotification(
          translate('err_process_failed', 'Gagal Memproses Video'),
          errorMsg,
          'error'
        );
      }
    } catch (err) {
      showNotification(
        translate('err_process_failed', 'Gagal Memproses Video'),
        translate('err_network', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.'),
        'error'
      );
    } finally {
      setLoadingState(false);
    }
  }

  async function triggerDirectDownload(e, dl, buttonElement) {
    e.preventDefault();
    const originalText = buttonElement.querySelector('.download-option-title')?.textContent || '';
    const titleEl = buttonElement.querySelector('.download-option-title');

    if (titleEl) titleEl.textContent = translate('toast_preparing_file', 'Menyiapkan File...');
    showToast(`${translate('toast_downloading', 'Mengunduh: ')}${dl.filename}`);

    const preferredUrl = dl.downloadUrl || dl.url;
    const directFallbackUrl = dl.url;

    try {
      // Method A: Fetch as Blob via same-origin proxy for exact filename save
      const res = await fetch(preferredUrl);
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
        setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);

        showToast(translate('toast_download_started', 'Unduhan berhasil dimulai!'));
        return;
      }
    } catch (blobErr) {
      console.warn('Blob fetch fallback triggered:', blobErr.message);
    } finally {
      if (titleEl) titleEl.textContent = originalText;
    }

    // Method B: Direct Anchor click fallback (navigating to downloadUrl with Content-Disposition)
    try {
      const directA = document.createElement('a');
      directA.href = preferredUrl;
      directA.download = dl.filename;
      directA.target = '_blank';
      directA.rel = 'noopener noreferrer';
      directA.style.display = 'none';
      document.body.appendChild(directA);
      directA.click();
      document.body.removeChild(directA);
      showToast(translate('toast_link_opened', 'Tautan unduhan dibuka. Periksa bilah unduhan browser Anda!'));
    } catch (fallbackErr) {
      if (directFallbackUrl && directFallbackUrl !== preferredUrl) {
        window.open(directFallbackUrl, '_blank', 'noopener,noreferrer');
      }
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
        optionLink.setAttribute('target', '_blank');

        // Localized labels
        let itemLabel = dl.label;
        let itemDesc = dl.description || '';

        if (dl.format === 'mp4') {
          if (dl.id === 'video_hd' || dl.quality === 'HD' || isPrimary) {
            itemLabel = translate('dl_no_watermark', dl.label);
            itemDesc = translate('dl_no_watermark_desc', dl.description || '');
          } else {
            itemLabel = translate('dl_watermark', dl.label);
            itemDesc = translate('dl_watermark_desc', dl.description || '');
          }
        } else if (dl.format === 'mp3') {
          itemLabel = translate('dl_audio', dl.label);
          itemDesc = translate('dl_audio_desc', dl.description || '');
        }

        optionLink.innerHTML = `
          <div class="download-option-left">
            <span class="download-format-badge">${dl.format ? dl.format.toUpperCase() : 'FILE'}</span>
            <div class="download-option-meta">
              <span class="download-option-title">${itemLabel}</span>
              <span class="download-option-desc">${itemDesc}</span>
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

      // User-friendly tip for mobile browsers
      const tipBox = document.createElement('div');
      tipBox.className = 'download-helper-tip';
      tipBox.style.cssText = 'margin-top: 1rem; padding: 0.85rem 1rem; border-radius: 12px; background: rgba(0,242,254,0.06); border: 1px solid rgba(0,242,254,0.2); font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: flex; gap: 0.5rem; align-items: flex-start;';
      tipBox.innerHTML = `
        <span style="font-size: 1.1rem; flex-shrink: 0;">💡</span>
        <span><strong>${translate('tip_prefix', 'Tips Download:')}</strong> ${translate('tip_text', 'File otomatis terunduh ke perangkat Anda. Jika video terbuka di tab baru pada browser ponsel, ketuk tombol ⋮ lalu pilih Download.')}</span>
      `;
      downloadOptionsContainer.appendChild(tipBox);
    } else {
      downloadOptionsContainer.innerHTML = `
        <div style="color: var(--text-secondary); font-size: 0.9rem; padding: 1rem 0;">
          ${translate('no_options_found', 'Tidak ada opsi unduhan yang dapat ditemukan untuk video ini.')}
        </div>
      `;
    }

    // 6. Reveal section and smooth scroll
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
