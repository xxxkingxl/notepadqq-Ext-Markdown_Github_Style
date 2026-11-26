# GitHub Markdown Preview for Notepadqq

A Node.js extension for **Notepadqq 2.1.1**. It adds a menu item to each Notepadqq window: **Extensions → GitHub Markdown Preview → Preview current document**.

## Features

- GitHub-inspired light/dark styling (follows browser/system color preference)
- Markdown tables, strikethrough and task lists
- Fenced code blocks with Highlight.js syntax highlighting
- Links and images
- Raw HTML disabled and rendered output sanitized
- Preview served locally on \`127.0.0.1\`

## Project layout

- \`main.js\` — Notepadqq entry point and menu integration
- \`lib/markdown.js\` — Markdown parsing, syntax highlighting and HTML sanitization
- \`lib/preview.js\` — local HTTP server and browser launch
- \`styles/github.css\` — preview styling

The modules are intentionally kept small and focused; there is no separate API-adapter module.

## Runtime compatibility

Notepadqq 2.1.1's official \`notepadqq-api\` (0.9.5) uses the obsolete \`Proxy.create()\` API. The small compatibility shim is kept in \`main.js\` and runs before the API is loaded.

The official API also depends on \`deasync\` for synchronous calls. Its installation/build under Node.js 26 still needs verification on the target system. This repository is therefore a source checkout, not yet a tested release archive.

## Development setup

1. Configure the Node.js runtime and npm executable in Notepadqq's extension preferences.
2. Clone this repository.
3. Run \`npm install\` in the repository directory.
4. Run `npm test` to test Markdown rendering and sanitization.\n5. Test with Notepadqq 2.1.1.

The Notepadqq extension installer expects a package archive containing \`nqq-manifest.json\` and an npm package tarball. A release ZIP/package has not yet been generated or validated.

## Use

Open a Markdown file and choose **Extensions → GitHub Markdown Preview → Preview current document**. The first invocation opens the browser preview. The page polls the local server; click the menu item again after editing to refresh the source contents. Syntax-highlighting themes are bundled locally.

## Current limitations

- Reads editor contents when the menu item is clicked; it does not yet subscribe to keystroke-level editor changes.
- Relative image paths are not currently resolved against the Markdown file's directory.
- Highlight.js syntax themes are loaded from the local npm dependency; the preview itself does not need a CDN or internet access.
- Not yet integration-tested against a running Notepadqq 2.1.1 instance.

## References

- [Notepadqq](https://github.com/notepadqq/notepadqq)
- [Official Node.js extension API](https://github.com/notepadqq/NotepadqqApi_Nodejs)
- [Official example extensions](https://github.com/notepadqq/example-extensions)
