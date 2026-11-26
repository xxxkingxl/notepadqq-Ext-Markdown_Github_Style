# GitHub Markdown Preview for Notepadqq

A Notepadqq extension targeting **Notepadqq 2.1.1**. It adds an item under `Extensions → GitHub Markdown Preview → Preview current document`.

## Features

- GitHub-inspired light/dark styling (follows browser/system color preference)
- GitHub-flavoured Markdown tables and strikethrough
- Fenced code blocks with Highlight.js syntax highlighting
- Task-list checkbox rendering, links and images
- Raw HTML disabled and rendered output sanitized

## Install on Linux

1. Ensure Node.js and npm are installed and configured in Notepadqq's preferences.
2. Copy this directory to `~/.config/Notepadqq/extensions/GitHubMarkdownPreview/`.
3. Run `npm install --omit=dev` in that directory.
4. Restart Notepadqq.

## Use

Open a Markdown file, then choose `Extensions → GitHub Markdown Preview → Preview current document`. The first invocation opens a browser tab. Click the menu item again after editing to send the latest editor contents to the preview; the page polls the local server for updates.

## Notes / limitations

- Uses Notepadqq's Node.js extension runtime and local-socket API.
- Does not modify or save the source document.
- Reads editor contents when the menu item is clicked; keystroke-level change events are not wired up yet.
- Remote image URLs work best; relative image paths are not currently resolved against the Markdown file's directory.
- Local preview server binds only to `127.0.0.1`.
- Highlight.js stylesheet is loaded from cdnjs.

## Compatibility

Prepared for Notepadqq 2.1.1. The extension API is experimental/old and this initial build needs testing in the target installation.

## References

- https://github.com/notepadqq/notepadqq
- https://github.com/notepadqq/example-extensions
