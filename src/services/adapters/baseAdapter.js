/**
 * Base Adapter Interface for video extraction providers.
 */
export class BaseAdapter {
  constructor(name) {
    this.name = name;
  }

  /**
   * Resolves a TikTok URL into structured video metadata and download options.
   * @param {string} url - Validated TikTok video URL
   * @returns {Promise<VideoResolutionResult>}
   */
  async resolve(url) {
    throw new Error(`Method resolve() must be implemented by adapter ${this.name}`);
  }
}

/**
 * Standardized error for downloader adapter failures.
 */
export class DownloaderServiceError extends Error {
  constructor(message, statusCode = 502, details = null) {
    super(message);
    this.name = 'DownloaderServiceError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
