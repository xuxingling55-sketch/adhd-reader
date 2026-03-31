import { UserSettings } from '../shared/types.js';

let currentSettings: UserSettings;

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings(): Promise<void> {
  const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
  currentSettings = response;
  applySettingsToUI();
}

function setupEventListeners(): void {
  // Extract mode change
  document.getElementById('extract-mode-select')?.addEventListener('change', (e) => {
    const mode = (e.target as HTMLSelectElement).value;
    const apiKeyGroup = document.getElementById('api-key-group');
    if (apiKeyGroup) {
      apiKeyGroup.style.display = mode === 'ai' ? 'block' : 'none';
    }
  });

  // Font size display
  document.getElementById('font-size-range')?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    const display = document.getElementById('font-size-value');
    if (display) display.textContent = `${value}px`;
  });

  // Save settings
  document.getElementById('save-btn')?.addEventListener('click', saveSettings);

  // Clear history
  document.getElementById('clear-history-btn')?.addEventListener('click', clearHistory);
}

function applySettingsToUI(): void {
  const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
  const fontSizeRange = document.getElementById('font-size-range') as HTMLInputElement;
  const extractModeSelect = document.getElementById('extract-mode-select') as HTMLSelectElement;
  const apiKeyInput = document.getElementById('api-key-input') as HTMLInputElement;
  const showHighlightCheck = document.getElementById('show-highlight-check') as HTMLInputElement;
  const highlightOnlyCheck = document.getElementById('highlight-only-check') as HTMLInputElement;

  if (themeSelect) themeSelect.value = currentSettings.theme;
  if (fontSizeRange) {
    fontSizeRange.value = currentSettings.fontSize.toString();
    const display = document.getElementById('font-size-value');
    if (display) display.textContent = `${currentSettings.fontSize}px`;
  }
  if (extractModeSelect) {
    extractModeSelect.value = currentSettings.extractMode;
    const apiKeyGroup = document.getElementById('api-key-group');
    if (apiKeyGroup) {
      apiKeyGroup.style.display = currentSettings.extractMode === 'ai' ? 'block' : 'none';
    }
  }
  if (apiKeyInput) apiKeyInput.value = currentSettings.apiKey || '';
  if (showHighlightCheck) showHighlightCheck.checked = currentSettings.showHighlight;
  if (highlightOnlyCheck) highlightOnlyCheck.checked = currentSettings.highlightOnly;
}

async function saveSettings(): Promise<void> {
  const newSettings: UserSettings = {
    theme: (document.getElementById('theme-select') as HTMLSelectElement).value as 'light' | 'dark',
    fontSize: parseInt((document.getElementById('font-size-range') as HTMLInputElement).value),
    extractMode: (document.getElementById('extract-mode-select') as HTMLSelectElement).value as 'rule' | 'ai',
    apiKey: (document.getElementById('api-key-input') as HTMLInputElement).value || undefined,
    showHighlight: (document.getElementById('show-highlight-check') as HTMLInputElement).checked,
    highlightOnly: (document.getElementById('highlight-only-check') as HTMLInputElement).checked
  };

  await chrome.runtime.sendMessage({
    action: 'saveSettings',
    settings: newSettings
  });

  currentSettings = newSettings;

  const status = document.getElementById('save-status');
  if (status) {
    status.textContent = '✓ 设置已保存';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  }
}

async function clearHistory(): Promise<void> {
  if (!confirm('确定要清除所有历史记录吗？此操作不可恢复。')) {
    return;
  }

  const history = await chrome.runtime.sendMessage({ action: 'getHistory' });
  if (history && history.length > 0) {
    for (const article of history) {
      await chrome.runtime.sendMessage({
        action: 'deleteArticle',
        id: article.id
      });
    }
  }

  alert('历史记录已清除');
}
