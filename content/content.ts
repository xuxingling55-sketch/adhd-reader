import { extractContent, detectLanguage } from './extractor.js';
import { extractHighlightsByRules } from './rule-extractor.js';
import { extractHighlightsByAI } from './ai-extractor.js';
import { createOverlay } from './highlighter.js';
import { Article } from '../shared/types.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startReading') {
    startReading(request.mode, request.apiKey).then(sendResponse);
    return true;
  }
  if (request.action === 'stopReading') {
    stopReading();
    sendResponse({ success: true });
  }
});

async function startReading(mode: 'rule' | 'ai', apiKey?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  // Extract content
  const extracted = extractContent();
  if (!extracted) {
    return { success: false, error: '无法提取网页内容' };
  }

  // Check if content is Chinese
  const fullText = extracted.content.join(' ');
  if (!detectLanguage(fullText)) {
    return { success: false, error: '此网页内容非中文，暂不支持' };
  }

  let highlights: number[];

  if (mode === 'ai' && apiKey) {
    try {
      highlights = await extractHighlightsByAI(extracted.content, apiKey);
    } catch (error) {
      console.error('AI extraction failed, falling back to rules:', error);
      highlights = extractHighlightsByRules(extracted.content);
    }
  } else {
    highlights = extractHighlightsByRules(extracted.content);
  }

  // Create overlay
  createOverlay(extracted.content, highlights, extracted.title);

  // Save to history
  const article: Article = {
    id: generateId(),
    url: window.location.href,
    title: extracted.title,
    content: extracted.content,
    highlights,
    readAt: Date.now(),
    readProgress: 0
  };

  chrome.runtime.sendMessage({
    action: 'saveArticle',
    article
  });

  return { success: true };
}

function stopReading(): void {
  // Clean up handled by overlay
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
