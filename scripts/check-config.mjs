import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parse } from "smol-toml";

const manifest = parse(readFileSync("extension.toml", "utf8"));
const language = parse(readFileSync("languages/mermaid/config.toml", "utf8"));
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const metadata = JSON.parse(readFileSync("grammar/tree-sitter.json", "utf8"));
assert.equal(manifest.schema_version, 1);
assert.equal(manifest.id, "mermaid");
assert.equal(manifest.version, pkg.version);
assert.equal(language.name, "Mermaid");
assert.deepEqual(language.path_suffixes, ["mermaid", "mmd"]);
assert.deepEqual(language.line_comments, ["%% "]);
const grammar = manifest.grammars[language.grammar];
assert.equal(new URL(grammar.repository).protocol, "https:");
assert.equal(grammar.path, "grammar");
assert.match(grammar.rev, /^[a-f0-9]{40}$/);
assert.equal(metadata.grammars[0].name, language.grammar);
assert.equal(metadata.grammars[0].path, ".");
assert.equal(metadata.metadata.version, pkg.version);
// Zed checks out the manifest revision, so test exactly what it will compile.
for (const file of [
  "grammar.js",
  "src/parser.c",
  "src/node-types.json",
  "src/grammar.json",
  "src/tree_sitter/parser.h",
]) {
  const path = `grammar/${file}`;
  const pinned = execFileSync("git", ["rev-parse", `${grammar.rev}:${path}`], {
    encoding: "utf8",
  }).trim();
  const local = execFileSync("git", ["hash-object", "--path", path, path], {
    encoding: "utf8",
  }).trim();
  assert.equal(local, pinned, `Manifest grammar revision is stale: ${file}`);
}
console.log(
  "Zed manifest, language configuration, and pinned grammar are consistent.",
);
