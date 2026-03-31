import { storage } from './storage.js';
import { UserSettings, ExtractResponse } from '../shared/types.js';
import { STORAGE_KEY, DEFAULT_SETTINGS } from '../shared/constants.js';

chrome.runtime.onInstalled.addListener(async () => {
  await storage.init();
  const settings = await getSettings();
  if (!settings.theme) {
    await saveSettings(DEFAULT_SETTINGS);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    getSettings().then(sendResponse);
    return true;
  }
  if (request.action === 'saveSettings') {
    saveSettings(request.settings).then(() => sendResponse({ success: true }));
    return true;
  }
  if (request.action === 'saveArticle') {
    storage.saveArticle(request.article).then(() => sendResponse({ success: true }));
    return true;
  }
  if (request.action === 'getHistory') {
    storage.getAllArticles().then(sendResponse);
    return true;
  }
  if (request.action === 'deleteArticle') {
    storage.deleteArticle(request.id).then(() => sendResponse({ success: true }));
    return true;
  }
  if (request.action === 'callAI') {
    callDeepSeek(request.apiKey, request.paragraphs).then(sendResponse);
    return true;
  }
});

export async function getSettings(): Promise<UserSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}

export async function callDeepSeek(apiKey: string, paragraphs: string[]): Promise<ExtractResponse> {
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: `请提取这篇文章的核心要点，返回段落序号列表（从0开始），只返回数字，用逗号分隔。文章内容：\n${paragraphs.map((p, i) => `[${i}] ${p}`).join('\n')}`
        }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      return { success: false, error: 'API调用失败' };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    const indices = content
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n >= 0 && n < paragraphs.length);

    return { success: true, highlights: indices };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}
