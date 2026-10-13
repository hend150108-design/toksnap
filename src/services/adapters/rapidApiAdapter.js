import { BaseAdapter, DownloaderServiceError } from './baseAdapter.js';
import { config } from '../../config/index.js';

export class RapidApiAdapter extends BaseAdapter {
  constructor() {
    super('rapidapi');
    this.apiKey = config.rapidApiKey;
    this.apiHost = config.rapidApiHost;
  }

  /**
   * Resolve TikTok video using RapidAPI
   * @param {string} url
   */
  async resolve(url) {
    if (!this.apiKey) {
      throw new DownloaderServiceError(
        'Adapter RapidAPI dipilih tetapi RAPIDAPI_KEY belum dikonfigurasi di file .env. Silakan tambahkan API key yang valid atau gunakan DEFAULT_ADAPTER=tikwm.',
        500,
        { configMissing: 'RAPIDAPI_KEY' }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    try {
      const endpoint = `https://${this.apiHost}/index?url=${encodeURIComponent(url)}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new DownloaderServiceError(
          `Penyedia RapidAPI merespons dengan kode HTTP ${response.status}`,
          502
        );
      }

      const json = await response.json();
      if (!json || json.code !== 0 || !json.data) {
        throw new DownloaderServiceError(
          json?.msg || 'Gagal memproses data video dari RapidAPI.',
          422
        );
      }

      const data = json.data;
      const videoId = data.id || Date.now().toString();
      const sanitizedTitle = (data.title || 'tiktok_video')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);

      const downloads = [];
      if (data.play) {
        downloads.push({
          id: 'video_hd',
          format: 'mp4',
          label: 'Download Video (No Watermark)',
          description: 'Kualitas HD',
          quality: 'HD',
          url: data.play,
          filename: `toksnap_${sanitizedTitle}_${videoId}.mp4`
        });
      }

      if (data.music) {
        downloads.push({
          id: 'audio_mp3',
          format: 'mp3',
          label: 'Download Audio (MP3)',
          description: 'Trek suara asli',
          quality: '128kbps',
          url: data.music,
          filename: `toksnap_${sanitizedTitle}_${videoId}_audio.mp3`
        });
      }

      return {
        id: videoId,
        title: data.title || 'Video TikTok',
        author: {
          name: data.author?.nickname || 'TikTok Creator',
          username: data.author?.unique_id || '',
          avatar: data.author?.avatar || ''
        },
        cover: data.cover || '',
        duration: data.duration || null,
        stats: {
          views: data.play_count ?? null,
          likes: data.digg_count ?? null,
          comments: data.comment_count ?? null,
          shares: data.share_count ?? null
        },
        downloads
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new DownloaderServiceError('Permintaan ke RapidAPI timeout.', 504);
      }
      if (err instanceof DownloaderServiceError) {
        throw err;
      }
      throw new DownloaderServiceError(`Gagal menghubungi RapidAPI: ${err.message}`, 502);
    } finally {
      clearTimeout(timeout);
    }
  }
}
