'use strict';

// Notepadqq's bundled Node API still uses the removed SpiderMonkey-era
// Proxy.create(handler, prototype) interface. Provide the small subset it
// needs using the standard ES Proxy API available in modern Node.js.
if (typeof Proxy.create !== 'function') {
  Object.defineProperty(Proxy, 'create', {
    configurable: true,
    writable: true,
    value(handler, prototype) {
      const target = Object.create(prototype || Object.prototype);
      return new Proxy(target, {
        get(_target, property, receiver) {
          if (typeof handler.get === 'function') {
            return handler.get(receiver, property);
          }
          return Reflect.get(_target, property, receiver);
        },
        ownKeys() {
          return typeof handler.getOwnPropertyNames === 'function'
            ? handler.getOwnPropertyNames()
            : Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor(_target, property) {
          return Reflect.getOwnPropertyDescriptor(target, property) || {
            configurable: true,
            enumerable: false,
            writable: false,
            value: undefined
          };
        }
      });
    }
  });
}

const http = require('node:http');
const { spawn } = require('node:child_process');
const { NotepadqqApi } = require('notepadqq-api');
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

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span', 'input', 'del']);
const allowedAttributes = {
  '*': ['class', 'id', 'align'],
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  input: ['type', 'checked', 'disabled']
};

let markdownSource = '# GitHub Markdown Preview\n\nOpen a Markdown file and choose the preview command from the Extensions menu.\n';
let previewServer;
let previewUrl;
let browserOpened = false;

function renderMarkdown(source) {
  return sanitizeHtml(md.render(source || ''), {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' })
    }
  });
}

function pageHtml() {
  const initial = renderMarkdown(markdownSource);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Markdown Preview</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css">
<style>
:root{color-scheme:light dark;--fg:#1f2328;--muted:#656d76;--border:#d1d9e0;--canvas:#fff;--subtle:#f6f8fa;--link:#0969da}
@media(prefers-color-scheme:dark){:root{--fg:#e6edf3;--muted:#9198a1;--border:#30363d;--canvas:#0d1117;--subtle:#161b22;--link:#4493f8}}
*{box-sizing:border-box}body{margin:0;background:var(--canvas);color:var(--fg);font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
#top{position:sticky;top:0;padding:9px 22px;background:var(--subtle);border-bottom:1px solid var(--border);color:var(--muted);font-size:12px}
main{max-width:1012px;margin:0 auto;padding:32px 40px 70px;overflow-wrap:anywhere}
.markdown-body h1,.markdown-body h2{font-weight:600;line-height:1.25;padding-bottom:.3em;border-bottom:1px solid var(--border)}
.markdown-body h1{font-size:2em}.markdown-body h2{font-size:1.5em}.markdown-body h3{font-size:1.25em}
.markdown-body a{color:var(--link);text-decoration:none}.markdown-body a:hover{text-decoration:underline}
.markdown-body p,.markdown-body blockquote,.markdown-body ul,.markdown-body ol,.markdown-body table,.markdown-body pre{margin-top:0;margin-bottom:16px}
.markdown-body blockquote{margin-left:0;padding:0 1em;color:var(--muted);border-left:4px solid var(--border)}
.markdown-body code{padding:.2em .4em;border-radius:6px;background:var(--subtle);font:85% ui-monospace,SFMono-Regular,Consolas,monospace}
.markdown-body pre{padding:16px;overflow:auto;background:var(--subtle);border:1px solid var(--border);border-radius:6px}
.markdown-body pre code{padding:0;background:transparent}.markdown-body table{border-spacing:0;border-collapse:collapse;width:max-content;max-width:100%;display:block;overflow:auto}
.markdown-body th,.markdown-body td{padding:6px 13px;border:1px solid var(--border)}.markdown-body th{font-weight:600;background:var(--subtle)}
.markdown-body tr:nth-child(2n){background:var(--subtle)}.markdown-body img{max-width:100%;height:auto}
.markdown-body hr{height:.25em;border:0;background:var(--border);margin:24px 0}
.markdown-body .task-list-item{list-style:none}.markdown-body .task-list-item input{margin-right:.5em}
@media(max-width:700px){main{padding:22px 18px 48px}}
</style></head><body><div id="top">GitHub-style Markdown preview · click the Notepadqq menu item to refresh</div>
<main><article id="content" class="markdown-body">${initial}</article></main>
<script>
let last=document.getElementById('content').innerHTML;
async function refresh(){try{const r=await fetch('/rendered',{cache:'no-store'});if(!r.ok)return;const html=await r.text();if(html!==last){document.getElementById('content').innerHTML=html;last=html}}catch(_){}}
setInterval(refresh,900);
</script></body></html>`;
}

function ensurePreviewServer() {
  if (previewServer) return Promise.resolve();
  return new Promise((resolve, reject) => {
    previewServer = http.createServer((req, res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-store');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(req.url === '/rendered' ? renderMarkdown(markdownSource) : pageHtml());
    });
    previewServer.once('error', reject);
    previewServer.listen(0, '127.0.0.1', () => {
      previewUrl = 'http://127.0.0.1:' + previewServer.address().port + '/';
      resolve();
    });
  });
}

function openBrowser(url) {
  let command;
  let args;
  if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else if (process.platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    command = 'xdg-open';
    args = [url];
  }
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.unref();
}

function showPreview(window) {
  try {
    const editor = window.currentEditor();
    if (!editor) {
      console.error('GitHub Markdown Preview: no active editor.');
      return;
    }
    markdownSource = editor.value() || '';
    ensurePreviewServer().then(() => {
      if (!browserOpened) {
        browserOpened = true;
        openBrowser(previewUrl);
      }
    }).catch(error => {
      console.error('GitHub Markdown Preview: unable to start preview server:', error);
    });
  } catch (error) {
    console.error('GitHub Markdown Preview:', error && error.stack ? error.stack : error);
  }
}

NotepadqqApi.connect(api => {
  api.onWindowInitialization(window => {
    const menu = window.addExtensionMenuItem(api.extensionId, 'Preview current document');
    menu.on('triggered', () => showPreview(window));
  });
});
