export function extractHighlightsByRules(content: string[]): number[] {
  const highlights = new Set<number>();
  const keywords = ['总结', '结论', '总之', '综上', '最终'];

  content.forEach((paragraph, index) => {
    // Rule 1: First and last paragraphs
    if (index === 0 || index === content.length - 1) {
      highlights.add(index);
      return;
    }

    // Rule 2: Contains summary/conclusion keywords
    if (keywords.some(kw => paragraph.includes(kw))) {
      highlights.add(index);
      return;
    }

    // Rule 3: Long paragraphs (> 50 chars)
    if (paragraph.length > 50) {
      highlights.add(index);
      return;
    }

    // Rule 4: Contains repeated keywords (simple frequency check)
    const words = paragraph.split('').filter(w => w.length >= 2);
    const wordCount = new Map<string, number>();
    words.forEach(w => {
      const count = wordCount.get(w) || 0;
      wordCount.set(w, count + 1);
    });

    // Find words that appear 3+ times
    const repeatedWords = Array.from(wordCount.entries())
      .filter(([_, count]) => count >= 3)
      .map(([word, _]) => word);

    if (repeatedWords.some(w => paragraph.includes(w))) {
      highlights.add(index);
    }
  });

  return Array.from(highlights).sort((a, b) => a - b);
}
