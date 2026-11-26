# GitHub Markdown Preview for Notepadqq

A Node.js extension for **Notepadqq 2.1.1**. It adds a menu item to each Notepadqq window: **Extensions → GitHub Markdown Preview → Preview current document**.

## Features

- GitHub-inspired light/dark styling (follows browser/system color preference)
- Markdown tables, strikethrough and task lists
- Fenced code blocks with Highlight.js syntax highlighting
- Links and images
- Raw HTML disabled and rendered output sanitized
- Preview served locally on `127.0.0.1`

## Runtime compatibility

Notepadqq 2.1.1's official `notepadqq-api` (0.9.5) uses the obsolete `Proxy.create()` API. This extension includes a compatibility shim for that API on modern Node.js versions, including Node.js 26.

The official API also depends on `deasync` for synchronous calls. Its installation/build under Node.js 26 still needs verification on the target system. This repository is therefore a source checkout, not yet a tested release archive.

## Development setup

1. Configure the Node.js runtime and npm executable in Notepadqq's extension preferences.
2. Clone this repository.
3. Run `npm install` in the repository directory.
4. Test with Notepadqq 2.1.1.

The Notepadqq extension installer expects a package archive containing `nqq-manifest.json` and an npm package tarball. A release ZIP/package has not yet been generated or validated.

## Use

Open a Markdown file and choose **Extensions → GitHub Markdown Preview → Preview current document**. The first invocation opens the browser preview. The page polls the local server; click the menu item again after editing to refresh the source contents.

## Current limitations

- Reads editor contents when the menu item is clicked; it does not yet subscribe to keystroke-level editor changes.
- Relative image paths are not currently resolved against the Markdown file's directory.
- Highlight.js stylesheet is loaded from cdnjs, so syntax highlighting styles require an internet connection.
- Not yet integration-tested against a running Notepadqq 2.1.1 instance.

## References

- [Notepadqq](https://github.com/notepadqq/notepadqq)
- [Official Node.js extension API](https://github.com/notepadqq/NotepadqqApi_Nodejs)
- [Official example extensions](https://github.com/notepadqq/example-extensions)
