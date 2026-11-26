'use strict';

const http = require('node:http');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const stylesheet = fs.readFileSync(
  path.join(__dirname, '..', 'styles', 'github.css'),
  'utf8'
);

function pageHtml(renderedMarkdown) {
  return [
    '<!doctype html>',
    '<html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Markdown Preview</title>',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css">',
    '<style>' + stylesheet + '</style></head><body>',
    '<div id="top">GitHub-style Markdown preview · click the Notepadqq menu item to refresh</div>',
    '<main><article id="content" class="markdown-body">' + renderedMarkdown + '</article></main>',
    '<script>',
    'let last=document.getElementById("content").innerHTML;',
    'async function refresh(){try{const r=await fetch("/rendered",{cache:"no-store"});if(!r.ok)return;const html=await r.text();if(html!==last){document.getElementById("content").innerHTML=html;last=html}}catch(_){}}',
    'setInterval(refresh,900);',
    '</script></body></html>'
  ].join('\n');
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

function createPreview(renderMarkdown) {
  let source = '# GitHub Markdown Preview\n\nOpen a Markdown file and choose the preview command from the Extensions menu.\n';
  let server;
  let url;
  let browserOpened = false;

  function ensureServer() {
    if (server) return Promise.resolve();

    return new Promise((resolve, reject) => {
      server = http.createServer((req, res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-store');

        if (req.url === '/github.css') {
          res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
          res.end(stylesheet);
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(req.url === '/rendered'
          ? renderMarkdown(source)
          : pageHtml(renderMarkdown(source)));
      });

      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        url = 'http://127.0.0.1:' + server.address().port + '/';
        resolve();
      });
    });
  }

  return {
    async show(markdownSource) {
      source = markdownSource || '';
      await ensureServer();

      if (!browserOpened) {
        openBrowser(url);
        browserOpened = true;
      }
    }
  };
}

module.exports = { createPreview };
