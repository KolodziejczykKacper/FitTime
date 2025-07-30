/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('Dark Mode Toggle & Sticky CTA', () => {
  let document, window;
  beforeEach(() => {
    // Załaduj HTML
    document = require('jsdom').JSDOM.fragment(html);
    window = document.defaultView;
    // Podstawowe elementy
    global.document = document;
    global.window = window;
    // Załaduj skrypt
    require('../script.js');
  });

  test('domyślny theme na podstawie prefers-color-scheme lub localStorage', () => {
    expect(document.documentElement.getAttribute('data-theme')).toMatch(/light|dark/);
  });

  test('kliknięcie toggle zmienia data-theme i ikonę', () => {
    const btn = document.getElementById('themeToggle');
    const icon = document.getElementById('iconTheme');
    const initial = document.documentElement.getAttribute('data-theme');
    btn.click();
    const after = document.documentElement.getAttribute('data-theme');
    expect(after).not.toBe(initial);
    expect(icon.src).toMatch(after === 'dark' ? 'sun.svg' : 'moon.svg');
  });

  test('stickyBtn ukryty początkowo i pojawia się gdy hero przestanie być w viewport', () => {
    const btn = document.getElementById('stickyBtn');
    expect(btn.style.display).toBe('none');
    // Sztuczka: wywołaj callback IO ręcznie
    window.IntersectionObserver.prototype.callback([{ isIntersecting: false }]);
    expect(btn.style.display).toBe('block');
  });
});