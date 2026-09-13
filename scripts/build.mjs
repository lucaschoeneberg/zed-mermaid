import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

// Tree-sitter 0.27 downloads its pinned WASI SDK into this project-local cache.
mkdirSync("grammars", { recursive: true });
execFileSync(
  resolve("node_modules/.bin/tree-sitter"),
  ["build", "--wasm", "--output", resolve("grammars/mermaid.wasm"), "grammar"],
  {
    stdio: "inherit",
    env: { ...process.env, XDG_CACHE_HOME: resolve(".cache") },
  },
);
