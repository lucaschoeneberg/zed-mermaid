# Mermaid for Zed

An extension that adds Mermaid support for Zed.

<img src="./img/syntax-highlight.png" alt="A snippet of Mermaid code in the Zed editor, with the syntax highlighted" />

Learn more about Mermaid at <https://mermaid.js.org>

## Installation

1. Open the Zed Extension Gallery by:<br />
   a. pressing `cmd-shift-x` (macOS)<br />
   b. or pressing `ctrl-shift-x` (Linux)<br />
   c. or triggering the `zed: extensions` command from the command pallet<br />
   d. or by selecting `"Zed > Extensions"` from the menu bar
2. Search for `"Mermaid"`.
3. Click `"Install"`.

## Mermaid 12 support

Adds current Mermaid syntax highlighting, a diagram outline, and YAML front matter
highlighting. This remains a language extension; it does not upgrade Zed's diagram
preview renderer. See [CHANGELOG.md](CHANGELOG.md) for compatibility and migration
notes, and [grammar/README.md](grammar/README.md) for development instructions.

## Acknowledgments

- Tree-sitter grammar by monaqa: [tree-sitter-mermaid](https://github.com/monaqa/tree-sitter-mermaid)
- Updated grammar based on [pappasam/tree-sitter-mermaid](https://github.com/pappasam/tree-sitter-mermaid), vendored with its MIT license.
