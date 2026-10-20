import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('6. Internationalization (i18n) Engine - Dual Language & Persistence', () => {
  const i18nFilePath = path.join(rootDir, 'public', 'js', 'i18n.js');
  const htmlFilePath = path.join(rootDir, 'public', 'index.html');

  const i18nContent = fs.readFileSync(i18nFilePath, 'utf8');
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  test('Supported languages must strictly be 2 languages: Indonesian (id) & English (en)', () => {
    // Check SUPPORTED_LANGUAGES array
    const langArrayMatch = i18nContent.match(/SUPPORTED_LANGUAGES\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(langArrayMatch, 'SUPPORTED_LANGUAGES must be defined in i18n.js');

    const codes = [...langArrayMatch[1].matchAll(/code:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
    assert.deepEqual(codes, ['id', 'en'], 'Only "id" and "en" should be present in SUPPORTED_LANGUAGES');

    const supportedCodesMatch = i18nContent.match(/SUPPORTED_CODES\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(supportedCodesMatch, 'SUPPORTED_CODES must be defined in i18n.js');
    const supportedCodes = [...supportedCodesMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
    assert.deepEqual(supportedCodes, ['id', 'en']);
  });

  test('English country badge must be EN and Indonesian must be ID', () => {
    assert.ok(i18nContent.includes(`country: 'ID'`), 'Indonesian badge must be ID');
    assert.ok(i18nContent.includes(`country: 'EN'`), 'English badge must be EN');
  });

  test('All HTML data-i18n keys must exist in both Indonesian and English translation dictionaries', () => {
    const regex = /data-i18n(?:-placeholder|-title|-aria)?=["']([^"']+)["']/g;
    const htmlKeys = new Set();
    let match;
    while ((match = regex.exec(htmlContent)) !== null) {
      htmlKeys.add(match[1]);
    }

    assert.ok(htmlKeys.size > 0, 'HTML must contain data-i18n keys');

    // Extract id and en dictionary keys from i18n.js
    const idBlockMatch = i18nContent.match(/id:\s*\{([\s\S]*?)\n\s*\},/);
    const enBlockMatch = i18nContent.match(/en:\s*\{([\s\S]*?)\n\s*\}\n\s*\};/);

    assert.ok(idBlockMatch, 'id translation object must be found');
    assert.ok(enBlockMatch, 'en translation object must be found');

    const keyRegex = /^\s*([a-zA-Z0-9_]+):/gm;
    const idKeys = new Set();
    while ((match = keyRegex.exec(idBlockMatch[1])) !== null) idKeys.add(match[1]);

    const enKeys = new Set();
    while ((match = keyRegex.exec(enBlockMatch[1])) !== null) enKeys.add(match[1]);

    const missingInId = [];
    const missingInEn = [];

    for (const key of htmlKeys) {
      if (!idKeys.has(key)) missingInId.push(key);
      if (!enKeys.has(key)) missingInEn.push(key);
    }

    assert.deepEqual(missingInId, [], `Missing keys in Indonesian: ${missingInId.join(', ')}`);
    assert.deepEqual(missingInEn, [], `Missing keys in English: ${missingInEn.join(', ')}`);
  });

  test('i18n.js must implement multi-layer persistence (localStorage, sessionStorage, cookie)', () => {
    assert.ok(i18nContent.includes('localStorage.setItem'), 'Must save to localStorage');
    assert.ok(i18nContent.includes('sessionStorage.setItem'), 'Must save to sessionStorage');
    assert.ok(i18nContent.includes('document.cookie ='), 'Must save to cookie');
    assert.ok(i18nContent.includes('detectPreferredLanguage'), 'Must have detectPreferredLanguage');
  });

  test('index.html must include early language bootstrap in head to prevent FOUC on refresh', () => {
    assert.ok(
      htmlContent.includes('<!-- Early Language Bootstrap to Prevent FOUC on Refresh -->'),
      'index.html head must contain early language bootstrap script'
    );
    assert.ok(
      htmlContent.includes("document.documentElement.lang = 'en'"),
      'Bootstrap must be able to set documentElement.lang to en before body render'
    );
  });
});
