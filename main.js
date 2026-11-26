'use strict';

// Notepadqq's API still uses the removed Proxy.create() interface.
// Keep this compatibility shim here so it runs before loading the API.
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

const { NotepadqqApi } = require('notepadqq-api');
const { renderMarkdown } = require('./lib/markdown');
const { createPreview } = require('./lib/preview');

const preview = createPreview(renderMarkdown);

function showPreview(window) {
  try {
    const editor = window.currentEditor();
    if (!editor) {
      console.error('GitHub Markdown Preview: no active editor.');
      return;
    }

    preview.show(editor.value() || '').catch(error => {
      console.error('GitHub Markdown Preview: unable to show preview:', error);
    });
  } catch (error) {
    console.error('GitHub Markdown Preview:', error && error.stack ? error.stack : error);
  }
}

NotepadqqApi.connect(api => {
  api.onWindowInitialization(window => {
    const menu = window.addExtensionMenuItem(
      api.extensionId,
      'Preview current document'
    );
    menu.on('triggered', () => showPreview(window));
  });
});
