# Mermaid grammar used by the Zed extension

Vendored from [pappasam/tree-sitter-mermaid](https://github.com/pappasam/tree-sitter-mermaid)
at commit `1a11e2d8cf11afcfdb768f537c1a9bde294c24f9` (MIT, see [LICENSE](LICENSE)).
The extension previously used monaqa's grammar. The newer grammar is designed for
editor highlighting and keeps unfamiliar statements recoverable.

Local changes add Mermaid 12 headers, Agentflow and Use Case declarations, reuse
flowchart syntax for Swimlanes, restore sequence control keywords, and handle
common Mermaid syntax missing upstream. Baseline families preserve tokens and
headers without claiming complete semantic parsing; see the support table in
[the extension README](../readme.md).

`grammar.js` is the source of truth. `src/` is generated with Tree-sitter CLI
0.27.0 and ABI 15. Zed compiles the checked-in C parser directly; it does not run
npm or the parser generator while loading this extension.

From the repository root:

```sh
npm ci
npm run generate
npm run build
npm test
```

The original 18 upstream corpus cases are retained (three expected trees are
adjusted only for emitted indentation nodes). The extension adds official
Mermaid 12 fixtures and explicit capture assertions so tolerant parsing alone
cannot pass as evidence of correct highlighting.

After changing the grammar, regenerate and test it, commit the grammar files,
and set `grammars.mermaid.rev` in `extension.toml` to that commit. Commit the
manifest change afterwards. This two-commit process lets Zed fetch an immutable,
existing grammar revision from this same repository. `npm run lint` checks that
the pinned sources exactly match the working copy. Do not squash away the grammar
commit without re-pinning the manifest.
