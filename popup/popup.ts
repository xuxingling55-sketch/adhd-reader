import { UserSettings, Article } from '../shared/types.js';

let currentSettings: UserSettings;
let currentHistory: Article[] = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadHistory();
  setupEventListeners();
});

async function loadSettings(): Promise<void> {
  const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
  currentSettings = response;
  applySettingsToUI();
}

async function loadHistory(): Promise<void> {
  const response = await chrome.runtime.sendMessage({ action: 'getHistory' });
  currentHistory = response || [];
  renderHistory();
}

function setupEventListeners(): void {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tabName = target.dataset.tab;
      if (tabName) switchTab(tabName);
    });
  });

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

  // Start reading
  document.getElementById('start-btn')?.addEventListener('click', startReading);
}

function switchTab(tabName: string): void {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const activeTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  const activeContent = document.getElementById(`${tabName}-tab`);

  if (activeTab) activeTab.classList.add('active');
  if (activeContent) activeContent.classList.add('active');
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
  alert('设置已保存');
}

async function startReading(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id || !tab.url) {
    alert('无法获取当前页面信息');
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      return chrome.runtime.sendMessage({
        action: 'startReading',
        mode: currentSettings.extractMode,
        apiKey: currentSettings.apiKey
      });
    }
  });

  window.close();
}

function renderHistory(): void {
  const list = document.getElementById('history-list');
  if (!list) return;

  list.innerHTML = '';

  const sorted = currentHistory
    .sort((a, b) => b.readAt - a.readAt)
    .slice(0, 10);

  sorted.forEach(article => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="title">${escapeHtml(article.title)}</div>
      <div class="time">${formatTime(article.readAt)}</div>
    `;
    li.addEventListener('click', () => openArticle(article.url));
    list.appendChild(li);
  });
}

function openArticle(url: string): void {
  chrome.tabs.create({ url });
  window.close();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN');
}
