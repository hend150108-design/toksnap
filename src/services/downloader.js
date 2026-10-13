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
    const adapter = this.getAdapter(adapterName);
    return await adapter.resolve(url);
  }
}

export const downloaderService = new DownloaderService();
