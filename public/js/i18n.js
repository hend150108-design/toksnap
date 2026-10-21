/**
 * TokSnap - Internationalization (i18n) Engine
 * Supported Languages: Indonesian (id) & English (en)
 * Persistent Multi-layer Storage (localStorage + sessionStorage + cookie + URL param)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'toksnap_language';

  const SUPPORTED_LANGUAGES = [
    { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Indonesia', flag: '🇮🇩', dir: 'ltr', country: 'ID' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr', country: 'EN' }
  ];

  const SUPPORTED_CODES = ['id', 'en'];

  const TRANSLATIONS = {
    // 1. INDONESIAN (Default)
    id: {
      meta_title: 'TokSnap — TikTok Video Downloader Tanpa Watermark HD & MP3',
      meta_description: 'TokSnap: Snap Your Favorite Videos. Download video TikTok kualitas tinggi HD tanpa watermark dan simpan musik audio MP3 secara gratis, cepat, aman di semua perangkat.',
      skip_link: 'Lewati ke konten utama',
      nav_home: 'Beranda',
      nav_how: 'Cara Pakai',
      nav_features: 'Keunggulan',
      nav_faq: 'FAQ',
      nav_about: 'Tentang Kami',
      server_online: 'Server Online',
      server_status_title: 'Server downloader siap melayani permintaan',
      select_language: 'Pilih Bahasa',
      hero_badge: 'TikTok Video Downloader',
      hero_title_html: 'Download Video TikTok <br class="desktop-br"><span class="highlight-text">Tanpa Watermark HD</span>',
      hero_desc: 'Simpan video TikTok favorit dan ekstrak lagu audio MP3 berkualitas tinggi secara gratis, cepat, dan tanpa batas di semua perangkat.',
      url_placeholder: 'Tempel link video TikTok di sini (atau drag & drop link)...',
      clear_btn_title: 'Hapus input',
      btn_paste: 'Tempel',
      btn_download: 'Download Sekarang',
      btn_downloading: 'Memproses...',
      drag_drop_notice: 'Lepaskan link TikTok di sini untuk menempelkan',
      quick_hint: 'Mendukung tautan resmi tiktok.com, vt.tiktok.com, dan vm.tiktok.com',
      metric_hd_value: 'Kualitas HD',
      metric_hd_label: 'Tanpa Kompresi',
      metric_mp3_value: 'Audio MP3',
      metric_mp3_label: 'Ekstrak Musik Asli',
      metric_privacy_value: '100% Privat',
      metric_privacy_label: 'Tanpa Log & Registrasi',
      preview_overlay_badge: 'Pratinjau Video',
      play_video: 'Putar Video',
      playing_live: 'Memutar Pratinjau',
      close_video: '✕ Tutup',
      verified_creator: 'Kreator TikTok Resmi',
      copy_caption: 'Salin Teks',
      stat_views: 'Jumlah Tayangan',
      stat_likes: 'Jumlah Suka',
      stat_comments: 'Komentar',
      stat_shares: 'Bagikan',
      btn_download_other: 'Unduh Video Lain',
      tip_prefix: 'Tips Download:',
      tip_text: 'File otomatis terunduh ke perangkat Anda. Jika video terbuka di tab baru pada browser ponsel, ketuk tombol ⋮ (titik tiga) lalu pilih Download atau tahan video dan pilih Simpan Video.',
      no_options_found: 'Tidak ada opsi unduhan yang dapat ditemukan untuk video ini.',
      dl_no_watermark: 'Download Video HD (Tanpa Watermark)',
      dl_no_watermark_desc: 'Kualitas Full HD jernih tanpa logo TikTok',
      dl_watermark: 'Download Video Standar (Dengan Watermark)',
      dl_watermark_desc: 'File MP4 video asli dengan watermark',
      dl_audio: 'Download Audio MP3 (Kualitas Suara Jernih)',
      dl_audio_desc: 'Ekstrak trek audio musik lagu TikTok',
      steps_subtitle: 'Panduan Singkat',
      steps_title: 'Cara Download Video TikTok dalam 3 Langkah',
      steps_desc: 'Hanya butuh beberapa detik untuk menyimpan video favorit langsung ke galeri HP atau komputer.',
      step_1_title: '1. Salin Tautan Video',
      step_1_desc: 'Buka aplikasi TikTok di ponsel atau browser, pilih video yang disukai, tekan tombol <strong>Bagikan</strong> lalu klik <strong>Salin Tautan</strong>.',
      step_2_title: '2. Tempel di TokSnap',
      step_2_desc: 'Buka situs TokSnap, tekan tombol <strong>Tempel</strong> di kolom pencarian, lalu tekan tombol <strong>Download Sekarang</strong>.',
      step_3_title: '3. Simpan ke Galeri',
      step_3_desc: 'Pilih format unduhan (Video HD Tanpa Watermark atau Audio MP3), file otomatis diunduh dan tersimpan ke perangkat Anda.',
      features_subtitle: 'Fitur Unggulan',
      features_title: 'Mengapa Memilih TokSnap?',
      features_desc: 'Platform download TikTok tercepat dengan standar keamanan dan kualitas gambar terbaik.',
      feature_1_title: 'Kecepatan Server Kilat',
      feature_1_desc: 'Didukung backend Node.js teroptimasi dengan pemrosesan URL dalam hitungan detik tanpa waktu tunggu atau antrean.',
      feature_2_title: 'Kualitas HD Asli',
      feature_2_desc: 'Unduh video dengan resolusi tajam 1080p/720p tanpa watermark buram, persis seperti yang diunggah oleh kreator aslinya.',
      feature_3_title: 'Ekstrak Audio MP3',
      feature_3_desc: 'Hanya butuh lagunya? Dapatkan rekaman audio MP3 jernih dari latar suara video TikTok hanya dengan satu klik.',
      feature_4_title: 'Kompatibel Semua Perangkat',
      feature_4_desc: 'Berjalan mulus di Android, iPhone (iOS Safari), iPad, Windows PC, hingga Mac tanpa perlu aplikasi tambahan.',
      feature_5_title: 'Aman & Tanpa Log Riwayat',
      feature_5_desc: 'Privasi Anda prioritas utama. Kami tidak menyimpan tautan, file unduhan, atau rekaman IP di basis data server.',
      feature_6_title: '100% Bebas Biaya',
      feature_6_desc: 'Unduh tanpa batas setiap hari secara gratis tanpa kartu kredit, registrasi akun, atau jebakan pop-up iklan spam.',
      faq_subtitle: 'Tanya Jawab',
      faq_title: 'Pertanyaan yang Sering Diajukan (FAQ)',
      faq_desc: 'Jawaban jelas dan transparan mengenai fungsionalitas dan privasi TokSnap.',
      faq_q1: 'Apakah mengunduh video di TokSnap sepenuhnya gratis?',
      faq_a1: 'Ya, TokSnap 100% gratis dan tidak memungut biaya apa pun. Anda dapat mengunduh video publik sebanyak apa pun yang Anda inginkan tanpa batasan kuota harian.',
      faq_q2: 'Apakah video hasil unduhan memiliki watermark TikTok?',
      faq_a2: 'TokSnap menyediakan tombol pilihan unduhan <strong>Video HD (Tanpa Watermark)</strong> serta opsi <strong>Video Standar (Watermark)</strong> sesuai preferensi kebutuhan Anda.',
      faq_q3: 'Apakah TokSnap bisa mengunduh dari akun TikTok privat?',
      faq_a3: 'Tidak. Demi menjaga privasi pembuat konten dan mematuhi etika hukum, TokSnap hanya memproses video yang diatur ke status <strong>publik</strong> oleh pembuatnya. Video privat atau video yang telah dihapus tidak dapat diakses.',
      faq_q4: 'Di mana lokasi penyimpanan file setelah diunduh?',
      faq_a4: 'File akan otomatis tersimpan di folder <strong>Downloads</strong> (Unduhan) perangkat Anda (pada browser Chrome, Safari di aplikasi Files/Photos iPhone, atau Windows/Mac).',
      faq_q5: 'Bagaimana cara mengunduh di iPhone / iPad (iOS)?',
      faq_a5: 'Di iOS 13 ke atas, cukup buka browser Safari, tempel link video, dan tekan Download. Safari akan menampilkan konfirmasi "Unduh". Setelah selesai, file tersimpan di aplikasi <strong>Files &gt; Downloads</strong> dan dapat disimpan ke galeri foto.',
      faq_q6: 'Mengapa video tertentu gagal diproses?',
      faq_a6: 'Hal ini dapat terjadi apabila tautan yang disalin tidak lengkap, video disetel privat atau dihapus oleh pemiliknya, atau pembatasan wilayah (geo-restriction). Pastikan tautan video dapat diputar secara publik sebelum dicoba kembali.',
      about_title: 'Tentang TokSnap',
      about_p1: 'TokSnap didirikan dengan komitmen untuk menyediakan pengalaman pengunduhan video TikTok yang bersih, cepat, dan aman tanpa gangguan iklan spam atau penipuan tautan palsu.',
      about_p2: 'Arsitektur server kami mengedepankan keamanan tinggi dengan perlindungan pencegahan SSRF (Server-Side Request Forgery), filter domain ketat, rate limiting terdistribusi, serta tidak pernah mencatat atau merekam riwayat URL video pengguna di database.',
      about_stat_privacy_lbl: 'Privasi Terjaga',
      about_stat_speed_lbl: 'Waktu Respons',
      about_stat_resolution_lbl: 'Maksimum Resolusi',
      about_stat_audio_lbl: 'Audio Terpisah',
      footer_desc: 'Snap Your Favorite Videos. Unduh video TikTok berkualitas tinggi dengan antarmuka yang bersih, cepat, dan mudah digunakan di segala perangkat.',
      footer_social_label: 'Ikuti & Hubungi Kami:',
      footer_quick_nav_title: 'Navigasi Cepat',
      footer_security_title: 'Keamanan & Etika',
      footer_sec_1: 'Hormati Hak Cipta Kreator',
      footer_sec_2: 'Hanya Konten Publik Sah',
      footer_sec_3: 'Tanpa Penyimpanan Data',
      footer_sec_4: 'Protokol Keamanan SSRF',
      footer_social_title: 'Media Sosial & Kontak',
      footer_disclaimer: '<strong>Pernyataan Hukum (Disclaimer):</strong> TokSnap adalah platform independen dan tidak terafiliasi, disponsori, atau berasosiasi resmi dengan TikTok, ByteDance Ltd., atau pihak terkait lainnya. Seluruh hak cipta, merek dagang, dan kepemilikan materi video serta musik audio adalah milik pembuat konten dan pemegang hak cipta masing-masing. TokSnap hanya ditujukan untuk tujuan pengarsipan pribadi yang sah sesuai hukum yang berlaku.',
      footer_copyright: '© 2026 TokSnap. Hak Cipta Dilindungi Undang-Undang.',
      toast_link_copied: 'Tautan berhasil disalin!',
      toast_caption_copied: 'Teks deskripsi berhasil disalin ke clipboard!',
      toast_copy_failed: 'Gagal menyalin teks',
      toast_preparing_file: 'Menyiapkan File...',
      toast_downloading: 'Mengunduh: ',
      toast_download_started: 'Unduhan berhasil dimulai!',
      toast_link_opened: 'Tautan unduhan dibuka. Periksa bilah unduhan browser Anda!',
      toast_processed_success: 'Video berhasil diproses! Silakan pilih format unduhan.',
      err_title_empty: 'Input Kosong',
      err_title_invalid: 'Format URL Tidak Sesuai',
      err_empty_url: 'Masukkan tautan video TikTok terlebih dahulu.',
      err_invalid_url: 'Tautan tidak valid. Masukkan URL TikTok yang benar (contoh: https://www.tiktok.com/@user/video/123...)',
      err_process_failed: 'Gagal Memproses Video',
      err_network: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
      err_unknown: 'Gagal memproses video. Pastikan link video TikTok publik dan valid.'
    },

    // 2. ENGLISH (US / Global)
    en: {
      meta_title: 'TokSnap — TikTok Video Downloader No Watermark HD & MP3',
      meta_description: 'TokSnap: Snap Your Favorite Videos. Download high quality TikTok videos without watermark in HD and extract MP3 audio songs for free, fast, and safely across all devices.',
      skip_link: 'Skip to main content',
      nav_home: 'Home',
      nav_how: 'How It Works',
      nav_features: 'Features',
      nav_faq: 'FAQ',
      nav_about: 'About Us',
      server_online: 'Server Online',
      server_status_title: 'Downloader server is ready to process requests',
      select_language: 'Select Language',
      hero_badge: 'TikTok Video Downloader',
      hero_title_html: 'Download TikTok Videos <br class="desktop-br"><span class="highlight-text">No Watermark HD</span>',
      hero_desc: 'Save your favorite TikTok videos and extract high-quality MP3 audio tracks for free, fast, and unlimited on all devices.',
      url_placeholder: 'Paste TikTok video link here (or drag & drop link)...',
      clear_btn_title: 'Clear input',
      btn_paste: 'Paste',
      btn_download: 'Download Now',
      btn_downloading: 'Processing...',
      drag_drop_notice: 'Drop TikTok link here to paste',
      quick_hint: 'Supports official tiktok.com, vt.tiktok.com, and vm.tiktok.com links',
      metric_hd_value: 'HD Quality',
      metric_hd_label: 'Lossless & Clear',
      metric_mp3_value: 'MP3 Audio',
      metric_mp3_label: 'Original Soundtrack',
      metric_privacy_value: '100% Private',
      metric_privacy_label: 'No Logs & No Sign-up',
      preview_overlay_badge: 'Video Preview',
      play_video: 'Play Video',
      playing_live: 'Playing Preview',
      close_video: '✕ Close',
      verified_creator: 'Verified TikTok Creator',
      copy_caption: 'Copy Text',
      stat_views: 'Views',
      stat_likes: 'Likes',
      stat_comments: 'Comments',
      stat_shares: 'Shares',
      btn_download_other: 'Download Another Video',
      tip_prefix: 'Download Tip:',
      tip_text: 'Files download automatically to your device. If the video opens in a new tab on mobile, tap the ⋮ (three dots) icon and select Download, or long-press the video and choose Save Video.',
      no_options_found: 'No download options could be found for this video.',
      dl_no_watermark: 'Download HD Video (No Watermark)',
      dl_no_watermark_desc: 'Crisp Full HD quality without TikTok logo',
      dl_watermark: 'Download Standard Video (With Watermark)',
      dl_watermark_desc: 'Original MP4 video file with watermark',
      dl_audio: 'Download MP3 Audio (Crystal Clear)',
      dl_audio_desc: 'Extract TikTok background music audio track',
      steps_subtitle: 'Quick Guide',
      steps_title: 'How to Download TikTok Videos in 3 Steps',
      steps_desc: 'Takes only a few seconds to save your favorite videos directly to your smartphone gallery or computer.',
      step_1_title: '1. Copy Video Link',
      step_1_desc: 'Open TikTok on your app or browser, pick your favorite video, tap <strong>Share</strong>, then click <strong>Copy Link</strong>.',
      step_2_title: '2. Paste into TokSnap',
      step_2_desc: 'Open TokSnap, tap <strong>Paste</strong> into the input search box, and click <strong>Download Now</strong>.',
      step_3_title: '3. Save to Gallery',
      step_3_desc: 'Choose your preferred download format (HD No Watermark or MP3 Audio), and the file downloads directly to your device.',
      features_subtitle: 'Key Features',
      features_title: 'Why Choose TokSnap?',
      features_desc: 'The fastest TikTok download platform engineered with enterprise-level security and pristine picture quality.',
      feature_1_title: 'Lightning Server Speed',
      feature_1_desc: 'Powered by an optimized Node.js architecture resolving video streams in milliseconds without queues.',
      feature_2_title: 'Authentic HD Quality',
      feature_2_desc: 'Download videos in sharp 1080p/720p resolution without blurred watermarks, exactly as uploaded by the creator.',
      feature_3_title: 'MP3 Audio Extraction',
      feature_3_desc: 'Only want the music? Extract crystal-clear MP3 sound from any TikTok video with just a single tap.',
      feature_4_title: 'All-Device Compatible',
      feature_4_desc: 'Works flawlessly on Android, iPhone (iOS Safari), iPad, Windows PC, and Mac with zero software installation.',
      feature_5_title: 'Safe & Zero Data Logs',
      feature_5_desc: 'Your privacy is paramount. We never log URLs, downloaded files, or user IP addresses on server databases.',
      feature_6_title: '100% Free Forever',
      feature_6_desc: 'Unlimited daily downloads with no subscription fees, credit card requirements, or intrusive ad traps.',
      faq_subtitle: 'Q & A',
      faq_title: 'Frequently Asked Questions (FAQ)',
      faq_desc: 'Clear, transparent answers about TokSnap features, performance, and privacy.',
      faq_q1: 'Is downloading videos on TokSnap completely free?',
      faq_a1: 'Yes, TokSnap is 100% free with no hidden charges. You can download as many public videos as you want with no daily limits.',
      faq_q2: 'Do downloaded videos have a TikTok watermark?',
      faq_a2: 'TokSnap provides an instant <strong>HD Video (No Watermark)</strong> button along with a <strong>Standard Video (With Watermark)</strong> option.',
      faq_q3: 'Can TokSnap download from private TikTok accounts?',
      faq_a3: 'No. To protect creator privacy and honor legal ethics, TokSnap only processes videos set to <strong>public</strong>. Private or removed videos cannot be accessed.',
      faq_q4: 'Where are files saved after downloading?',
      faq_a4: 'Files automatically save to your device default <strong>Downloads</strong> folder (on Chrome, Safari in Files/Photos on iPhone, or PC/Mac).',
      faq_q5: 'How do I download on iPhone / iPad (iOS)?',
      faq_a5: 'On iOS 13 and above, open Safari, paste the link, and tap Download. Safari will prompt "Download". Once done, find your file in <strong>Files &gt; Downloads</strong> and save to Photos.',
      faq_q6: 'Why do certain videos fail to process?',
      faq_a6: 'This can happen if the link is incomplete, the video is private or removed by its owner, or restricted by region. Ensure the video plays publicly and retry.',
      about_title: 'About TokSnap',
      about_p1: 'TokSnap was created with a mission to deliver a clean, blazingly fast, and dependable TikTok video downloader free from scam links or annoying spam ads.',
      about_p2: 'Our server architecture employs strict SSRF protection, verified domain filters, distributed rate limiting, and strictly zero database tracking of video URLs.',
      about_stat_privacy_lbl: 'Privacy Guarded',
      about_stat_speed_lbl: 'Response Time',
      about_stat_resolution_lbl: 'Max Resolution',
      about_stat_audio_lbl: 'Separate Audio',
      footer_desc: 'Snap Your Favorite Videos. Download high quality TikTok videos with a clean, fast, and easy-to-use interface across all devices.',
      footer_social_label: 'Follow & Contact Us:',
      footer_quick_nav_title: 'Quick Navigation',
      footer_security_title: 'Security & Ethics',
      footer_sec_1: 'Respect Creator Copyright',
      footer_sec_2: 'Valid Public Content Only',
      footer_sec_3: 'Zero Data Retention',
      footer_sec_4: 'SSRF Security Protocols',
      footer_social_title: 'Social Media & Contact',
      footer_disclaimer: '<strong>Legal Disclaimer:</strong> TokSnap is an independent platform and is not affiliated, sponsored, or officially associated with TikTok, ByteDance Ltd., or any related entities. All copyrights, trademarks, and ownership of video materials and audio belong to their respective creators and copyright holders. TokSnap is intended strictly for personal, lawful archiving under applicable laws.',
      footer_copyright: '© 2026 TokSnap. All Rights Reserved.',
      toast_link_copied: 'Link successfully copied!',
      toast_caption_copied: 'Caption copied to clipboard!',
      toast_copy_failed: 'Failed to copy text',
      toast_preparing_file: 'Preparing File...',
      toast_downloading: 'Downloading: ',
      toast_download_started: 'Download started successfully!',
      toast_link_opened: 'Download link opened. Check your browser download bar!',
      toast_processed_success: 'Video processed successfully! Choose your download format.',
      err_title_empty: 'Empty Input',
      err_title_invalid: 'Invalid URL Format',
      err_empty_url: 'Please enter a TikTok video link first.',
      err_invalid_url: 'Invalid link. Please enter a valid TikTok URL (e.g. https://www.tiktok.com/@user/video/123...)',
      err_process_failed: 'Failed to Process Video',
      err_network: 'Unable to connect to server. Check your internet connection and try again.',
      err_unknown: 'Failed to process video. Make sure the TikTok video is public and valid.'
    }
  };

  /**
   * Synchronize active language to URL query parameter (?lang=en or ?lang=id)
   * Ensures browser reload/refresh (F5, swipe refresh) retains the selected language
   */
  function syncUrlLanguage(langCode) {
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState && window.location) {
        const url = new URL(window.location.href);
        if (url.searchParams.get('lang') !== langCode) {
          url.searchParams.set('lang', langCode);
          window.history.replaceState(null, '', url.toString());
        }
      }
    } catch (e) {}
  }

  /**
   * Save selected language with high redundancy:
   * 1. localStorage (primary persistence across refreshes & sessions)
   * 2. sessionStorage (secondary session backup)
   * 3. Cookie (works even if localStorage is restricted or in strict privacy modes)
   * 4. window.name (ultra-resilient fallback persisting across reloads in same tab)
   * 5. URL query parameter (ensures browser reload strictly keeps language)
   */
  function saveLanguage(langCode) {
    if (!SUPPORTED_CODES.includes(langCode)) return;
    try {
      localStorage.setItem(STORAGE_KEY, langCode);
    } catch (e) {
      console.warn('[toksnapI18n] localStorage write failed:', e);
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, langCode);
    } catch (e) {}

    try {
      // 1 year expiration cookie with SameSite=Lax
      const oneYear = 365 * 24 * 60 * 60;
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(langCode)}; max-age=${oneYear}; path=/; SameSite=Lax`;
    } catch (e) {}

    try {
      if (typeof window !== 'undefined') {
        const currentName = window.name || '';
        const cleanName = currentName.replace(/toksnap_language:[a-z]+;?/g, '').trim();
        window.name = `toksnap_language:${langCode};` + cleanName;
      }
    } catch (e) {}

    syncUrlLanguage(langCode);
  }

  /**
   * Detect preferred language prioritizing user preference:
   * 1. Explicit URL parameter ?lang=en or ?lang=id
   * 2. localStorage saved preference
   * 3. sessionStorage saved preference
   * 4. Cookie saved preference
   * 5. window.name saved preference
   * 6. Browser navigator language (en -> en, otherwise id)
   * 7. Default fallback: 'id'
   */
  function detectPreferredLanguage() {
    // 1. URL search parameter
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const urlLang = (params.get('lang') || '').toLowerCase().trim();
        if (SUPPORTED_CODES.includes(urlLang)) {
          return urlLang;
        }
      }
    } catch (e) {}

    // 2. localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_CODES.includes(saved.toLowerCase())) {
        return saved.toLowerCase();
      }
    } catch (e) {}

    // 3. sessionStorage
    try {
      const sessionSaved = sessionStorage.getItem(STORAGE_KEY);
      if (sessionSaved && SUPPORTED_CODES.includes(sessionSaved.toLowerCase())) {
        return sessionSaved.toLowerCase();
      }
    } catch (e) {}

    // 4. Cookie
    try {
      const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + STORAGE_KEY + '=([^;]+)'));
      if (match && match[1]) {
        const cookieVal = decodeURIComponent(match[1]).toLowerCase().trim();
        if (SUPPORTED_CODES.includes(cookieVal)) {
          return cookieVal;
        }
      }
    } catch (e) {}

    // 5. window.name fallback
    try {
      if (typeof window !== 'undefined' && window.name) {
        const nameMatch = window.name.match(/toksnap_language:([a-z]+)/);
        if (nameMatch && SUPPORTED_CODES.includes(nameMatch[1])) {
          return nameMatch[1];
        }
      }
    } catch (e) {}

    // 6. Browser language (if English -> 'en', default 'id')
    try {
      const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (browserLang.startsWith('en')) {
        return 'en';
      }
    } catch (e) {}

    return 'id'; // Default
  }

  // Pre-initialize current language immediately
  let currentLanguage = detectPreferredLanguage();

  function getLanguageInfo(langCode) {
    const code = langCode || currentLanguage;
    return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
  }

  function t(key, fallback = '') {
    const langObj = TRANSLATIONS[currentLanguage] || TRANSLATIONS['id'];
    if (langObj && key in langObj) {
      return langObj[key];
    }
    // Fallback to Indonesian if key exists there
    if (TRANSLATIONS['id'] && key in TRANSLATIONS['id']) {
      return TRANSLATIONS['id'][key];
    }
    return fallback || key;
  }

  function applyLanguage(langCode, save = true) {
    if (!SUPPORTED_CODES.includes(langCode)) {
      langCode = 'id';
    }
    currentLanguage = langCode;

    if (save) {
      saveLanguage(langCode);
    } else {
      syncUrlLanguage(langCode);
    }

    const langInfo = getLanguageInfo(langCode);

    // 1. Update HTML document attributes
    if (document.documentElement) {
      document.documentElement.lang = langCode;
      document.documentElement.dir = langInfo.dir || 'ltr';
    }

    // 2. Update Document Title & Meta Description
    const metaTitle = t('meta_title');
    if (metaTitle) document.title = metaTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t('meta_description')) {
      metaDesc.setAttribute('content', t('meta_description'));
    }

    // 3. Update Elements with [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== undefined && val !== null) {
        el.innerHTML = val;
      }
    });

    // 4. Update Elements with [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val) {
        el.setAttribute('placeholder', val);
      }
    });

    // 5. Update Elements with [data-i18n-title]
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      const val = t(key);
      if (val) {
        el.setAttribute('title', val);
      }
    });

    // 6. Update Elements with [data-i18n-aria]
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const val = t(key);
      if (val) {
        el.setAttribute('aria-label', val);
      }
    });

    // 7. Update Header Flag & Country Code Badge
    const currentFlagEl = document.getElementById('currentLangFlag');
    const currentCodeEl = document.getElementById('currentLangCode');
    if (currentFlagEl) currentFlagEl.textContent = langInfo.flag;
    if (currentCodeEl) currentCodeEl.textContent = langInfo.country;

    // 8. Update active state in desktop dropdown
    document.querySelectorAll('.lang-item-btn').forEach((btn) => {
      const btnCode = btn.getAttribute('data-lang');
      const isActive = btnCode === langCode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      const checkEl = btn.querySelector('.lang-check-icon');
      if (checkEl) checkEl.style.visibility = isActive ? 'visible' : 'hidden';
    });

    // 9. Update mobile chips
    document.querySelectorAll('.mobile-lang-chip').forEach((chip) => {
      const chipCode = chip.getAttribute('data-lang');
      chip.classList.toggle('active', chipCode === langCode);
    });

    // 10. Dispatch event for other modules (e.g. app.js re-render)
    window.dispatchEvent(
      new CustomEvent('toksnap:languageChanged', {
        detail: { lang: langCode, langInfo: langInfo }
      })
    );
  }

  function initI18n() {
    const preferredLang = detectPreferredLanguage();
    applyLanguage(preferredLang, false);
  }

  // Expose API globally
  window.toksnapI18n = {
    languages: SUPPORTED_LANGUAGES,
    translations: TRANSLATIONS,
    getCurrentLanguage: () => currentLanguage,
    getLanguageInfo: (code) => getLanguageInfo(code || currentLanguage),
    setLanguage: applyLanguage,
    detectPreferredLanguage: detectPreferredLanguage,
    t: t,
    init: initI18n
  };

  // Immediate DOM synchronization if body is already available
  if (document.body) {
    initI18n();
  }

  // Also hook into DOMContentLoaded to catch any elements parsed later
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
})();
