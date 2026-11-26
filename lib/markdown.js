'use strict';

const MarkdownIt = require('markdown-it');
const taskLists = require('markdown-it-task-lists');
const hljs = require('highlight.js');
const sanitizeHtml = require('sanitize-html');

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(code, { language, ignoreIllegals: true }).value +
          '</code></pre>';
      } catch (_) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(code) + '</code></pre>';
  }
})
  .enable(['table', 'strikethrough'])
  .use(taskLists, { enabled: true, label: true });

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  'img', 'h1', 'h2', 'span', 'input', 'del'
]);

const allowedAttributes = {
  '*': ['class', 'id', 'align'],
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  input: ['type', 'checked', 'disabled']
};

function renderMarkdown(source) {
  return sanitizeHtml(md.render(source || ''), {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank'
      })
    }
  });
}

module.exports = { renderMarkdown };
