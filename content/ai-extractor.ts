export async function extractHighlightsByAI(
  content: string[],
  apiKey: string
): Promise<number[]> {
  const response = await chrome.runtime.sendMessage({
    action: 'callAI',
    apiKey,
    paragraphs: content
  });

  if (response.success) {
    return response.highlights || [];
  }

  throw new Error(response.error || 'AI extraction failed');
}
