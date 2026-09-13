import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
execFileSync(resolve("node_modules/.bin/tree-sitter"), ["test"], {
  cwd: "grammar",
  stdio: "inherit",
  env: { ...process.env, XDG_CACHE_HOME: resolve(".cache") },
});
