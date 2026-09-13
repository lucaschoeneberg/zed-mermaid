# Changelog

## 0.2.0 — 2026-09-13

Mermaid 12 compatibility and maintenance tooling contributed by Luca Schöneberg,
listed alongside original author Gabriel Silva in the extension manifest.

### Language support

- Migrate from monaqa's grammar at `90ae195b31933ceb9d079abfa8a3ad0a36fee4cc`
  to pappasam's tolerant grammar at `1a11e2d8cf11afcfdb768f537c1a9bde294c24f9`,
  vendored with its MIT license and focused compatibility fixes.
- Recognize current Mermaid diagram headers, including Use Case, Agentflow,
  Swimlanes, Venn, Ishikawa, and all four Railroad variants. Add Use Case and
  Agentflow declarations and reuse flowchart rules where appropriate.
- Support common modern metadata and fix bare flowchart nodes, keyword-prefix
  identifiers, spaced architecture edges, hyphenated ER relationships, Gantt
  colons/commas, inline Pie titles, and Journey actor lists.
- Retain legacy sequence control keyword highlighting. Use current Zed theme
  captures instead of unsupported `@field`, `@float`, `@include`, or Neovim-only
  captures/properties. Add diagram outline and YAML front matter injection.
- Preserve `.mmd`, `.mermaid`, the `Mermaid` language name, extension ID, and
  comment toggling. The grammar migration changes syntax trees and some colors;
  custom queries written for the previous grammar must be updated.

### Manifest and tooling

- Bump extension version to 0.2.0, point repository metadata to this fork, and use
  the documented `rev` field instead of the legacy `commit` alias. Add `path` for
  the vendored grammar; keep the supported manifest schema version 1.
- Pin Mermaid **12.0.0**, Tree-sitter CLI / web-tree-sitter **0.27.0**, jsdom
  **30.0.1**, Prettier **3.9.6**, and smol-toml **1.8.0** as development tools.
  There were no existing npm or Rust runtime dependencies to upgrade.
- Pin transitive `lodash-es` to **4.18.1** via an npm override: Mermaid's
  Chevrotain dependency otherwise locks an affected older version. Keep this
  override until upstream adopts a fixed compatible version. The full parser
  suite verifies compatibility; the resulting npm audit reports no vulnerabilities.
- Generate Tree-sitter ABI 15 and compile WASM with the stable toolchain. Add
  deterministic lockfile, manifest/query validation, retained grammar corpus,
  Mermaid 12 fixture tests, and CI on Node 22/24/26 with current stable Actions.

### Breaking changes and limits

- Development requires Node 22.12+ and a current Zed with ABI 15 support.
- Mermaid 12's renderer defaults change to ELK / redux-color / neo for applicable
  diagram types. Explicitly set `layout: dagre`, `theme: default`, and
  `look: classic` to preserve previous rendering. `defaultRenderer` is removed;
  use top-level `layout`. See the linked release notes in the README.
- Mermaid remains a development-time reference validator; this language-only
  extension does not provide or upgrade a preview renderer, animations, layout
  engines in other integrations, an LSP, or external icon/ZenUML integrations.
- Grammar coverage is tiered. Some recent and complex syntax receives basic
  token highlighting rather than complete semantic structure. See the README
  support table. Rendering and interactive Zed behavior need a separate manual
  smoke test; automated checks cover parser/build/query compatibility.
