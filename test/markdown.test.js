'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderMarkdown } = require('../lib/markdown');

test('renders GitHub-style Markdown features', () => {
  const html = renderMarkdown('# Heading\n\n| A | B |\n| - | - |\n| one | two |\n\n- [x] done\n- [ ] todo\n\n~~old~~');
  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<table>/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /<s>old<\/s>/);
});

test('does not render raw HTML or executable links', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert(1))');
  assert.doesNotMatch(html, /<script>/i);
  assert.doesNotMatch(html, /href=["']javascript:/i);
});

test('highlights fenced code blocks', () => {
  const html = renderMarkdown('```js\nconst answer = 42;\n```');
  assert.match(html, /hljs/);
  assert.match(html, /answer/);
});
