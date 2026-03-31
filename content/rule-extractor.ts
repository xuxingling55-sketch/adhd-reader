import { Segment } from 'segmentit';

const segmentit = Segment.useDefault();

export function extractHighlightsByRules(content: string[]): number[] {
  const highlights = new Set<number>();
  const keywords = findKeywords(content);

  content.forEach((paragraph, index) => {
    // Rule 1: First and last paragraphs
    if (index === 0 || index === content.length - 1) {
      highlights.add(index);
      return;
    }

    // Rule 2: Contains summary/conclusion keywords
    const summaryKeywords = ['总结', '结论', '总之', '综上', '最终'];
    if (summaryKeywords.some(kw => paragraph.includes(kw))) {
      highlights.add(index);
      return;
    }

    // Rule 3: Long paragraphs (> 50 chars)
    if (paragraph.length > 50) {
      highlights.add(index);
      return;
    }

    // Rule 4: Contains repeated keywords
    const segments = segmentit.doSegment(paragraph, { simple: true });
    const paragraphWords = segments.map(s => s.w);
    const matches = paragraphWords.filter(w => keywords.includes(w));
    if (matches.length >= 2) {
      highlights.add(index);
    }
  });

  return Array.from(highlights).sort((a, b) => a - b);
}

function findKeywords(content: string[]): string[] {
  const wordCount = new Map<string, number>();

  content.forEach(paragraph => {
    const segments = segmentit.doSegment(paragraph, { simple: true });
    segments.forEach(segment => {
      if (segment.w.length > 1) {
        const count = wordCount.get(segment.w) || 0;
        wordCount.set(segment.w, count + 1);
      }
    });
  });

  return Array.from(wordCount.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, _]) => word);
}
