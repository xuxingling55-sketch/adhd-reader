import { COLORS } from '../shared/constants.js';

let overlayContainer: HTMLElement | null = null;
let originalContent: HTMLElement | null = null;
let highlightOnly = false;

export function createOverlay(
  content: string[],
  highlights: number[],
  title: string
): void {
  removeOverlay();

  // Hide original content
  document.body.style.display = 'none';

  // Create overlay container
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'adhd-reader-overlay';
  overlayContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${COLORS.light.background};
    color: ${COLORS.light.text};
    overflow-y: auto;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.8;
  `;

  // Create header
  const header = createHeader(title);
  overlayContainer.appendChild(header);

  // Create content paragraphs
  content.forEach((paragraph, index) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    p.style.cssText = `
      margin: 20px 0;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 16px;
    `;

    if (highlights.includes(index)) {
      p.style.background = COLORS.light.highlight;
      p.style.borderLeft = `4px solid ${COLORS.primary}`;
    }

    if (highlightOnly && !highlights.includes(index)) {
      p.style.display = 'none';
    }

    overlayContainer.appendChild(p);
  });

  document.body.appendChild(overlayContainer);
  document.body.style.display = 'block';
  overlayContainer.style.display = 'block';

  // Apply theme
  applyTheme();
}

export function removeOverlay(): void {
  if (overlayContainer) {
    overlayContainer.remove();
    overlayContainer = null;
  }
  document.body.style.display = '';
}

export function updateHighlightOnly(enabled: boolean): void {
  highlightOnly = enabled;
  if (!overlayContainer) return;

  const paragraphs = overlayContainer.querySelectorAll('p');
  paragraphs.forEach((p, index) => {
    const isHighlighted = p.style.borderLeft?.includes(COLORS.primary);
    if (highlightOnly && !isHighlighted) {
      (p as HTMLElement).style.display = 'none';
    } else {
      (p as HTMLElement).style.display = 'block';
    }
  });
}

export function applyTheme(theme?: 'light' | 'dark'): void {
  if (!overlayContainer) return;

  const colors = theme === 'dark' ? COLORS.dark : COLORS.light;
  overlayContainer.style.background = colors.background;
  overlayContainer.style.color = colors.text;

  const paragraphs = overlayContainer.querySelectorAll('p');
  paragraphs.forEach(p => {
    const isHighlighted = (p as HTMLElement).style.borderLeft?.includes(COLORS.primary);
    if (isHighlighted) {
      (p as HTMLElement).style.background = colors.highlight;
    }
  });
}

function createHeader(title: string): HTMLElement {
  const header = document.createElement('div');
  header.style.cssText = `
    position: sticky;
    top: 0;
    background: ${COLORS.light.background};
    padding: 20px 0;
    border-bottom: 1px solid ${COLORS.light.border};
    margin-bottom: 20px;
    z-index: 100;
  `;

  const h1 = document.createElement('h1');
  h1.textContent = title;
  h1.style.cssText = `
    margin: 0 0 16px 0;
    font-size: 28px;
    font-weight: 600;
  `;

  const controls = document.createElement('div');
  controls.style.cssText = `
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  `;

  // Exit button
  const exitBtn = createButton('◀ 退出阅读', () => {
    removeOverlay();
  });
  controls.appendChild(exitBtn);

  // Theme toggle
  const themeBtn = createButton('🌙 夜间', () => {
    chrome.runtime.sendMessage({ action: 'getSettings' }).then((settings) => {
      const newTheme = settings.theme === 'light' ? 'dark' : 'light';
      chrome.runtime.sendMessage({ action: 'saveSettings', settings: { ...settings, theme: newTheme } });
      applyTheme(newTheme);
    });
  });
  controls.appendChild(themeBtn);

  // Highlight toggle
  const highlightBtn = createButton('🟢 高亮开关', () => {
    highlightOnly = !highlightOnly;
    updateHighlightOnly(highlightOnly);
  });
  controls.appendChild(highlightBtn);

  header.appendChild(h1);
  header.appendChild(controls);
  return header;
}

function createButton(text: string, onClick: () => void): HTMLElement {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.cssText = `
    padding: 8px 16px;
    background: ${COLORS.primary};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  btn.onclick = onClick;
  return btn;
}
