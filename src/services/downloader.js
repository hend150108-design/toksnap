import { config } from '../config/index.js';
import { TikwmAdapter } from './adapters/tikwmAdapter.js';
import { RapidApiAdapter } from './adapters/rapidApiAdapter.js';
import { DownloaderServiceError } from './adapters/baseAdapter.js';

class DownloaderService {
  constructor() {
    this.adapters = new Map();
    this.registerAdapter('tikwm', new TikwmAdapter());
    this.registerAdapter('rapidapi', new RapidApiAdapter());

    this.defaultAdapterName = config.defaultAdapter.toLowerCase();
  }

  registerAdapter(name, adapterInstance) {
    this.adapters.set(name.toLowerCase(), adapterInstance);
  }

  getAdapter(name) {
    const adapter = this.adapters.get((name || this.defaultAdapterName).toLowerCase());
    if (!adapter) {
      throw new DownloaderServiceError(
        `Adapter video downloader '${name || this.defaultAdapterName}' tidak ditemukan. Pilihan yang tersedia: ${Array.from(this.adapters.keys()).join(', ')}`,
        500
      );
    }
    return adapter;
  }

  async resolveVideo(url, adapterName = null) {
    const primaryName = (adapterName || this.defaultAdapterName).toLowerCase();
    const adapter = this.getAdapter(primaryName);

    try {
      return await adapter.resolve(url);
    } catch (primaryErr) {
      // Seamless fallback to RapidAPI if primary adapter (e.g. tikwm) fails and RAPIDAPI_KEY is configured
      if (primaryName === 'tikwm' && config.rapidApiKey && this.adapters.has('rapidapi')) {
        try {
          console.warn(`[DownloaderService] Adapter '${primaryName}' gagal: ${primaryErr.message}. Mencoba fallback ke RapidAPI...`);
          const rapidAdapter = this.adapters.get('rapidapi');
          return await rapidAdapter.resolve(url);
        } catch (fallbackErr) {
          console.error(`[DownloaderService] Fallback ke RapidAPI juga gagal: ${fallbackErr.message}`);
        }
      }
      throw primaryErr;
    }
  }
}

export const downloaderService = new DownloaderService();
