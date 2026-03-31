import { Readability } from '@mozilla/readability';

export function extractContent(): { title: string; content: string[] } | null {
  const documentClone = document.cloneNode(true) as Document;
  const readability = new Readability(documentClone);

  try {
    const article = readability.parse();
    if (!article) return null;

    const paragraphs = article.textContent
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return {
      title: article.title || document.title,
      content: paragraphs
    };
  } catch (error) {
    console.error('Content extraction failed:', error);
    return null;
  }
}

export function detectLanguage(text: string): boolean {
  // Simple heuristic: check for Chinese characters
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  return chineseChars !== null && chineseChars.length / text.length > 0.3;
}
