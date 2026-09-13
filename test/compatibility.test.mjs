import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { after, test } from "node:test";
import { JSDOM } from "jsdom";
import { Language, Parser, Query } from "web-tree-sitter";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import("mermaid");
mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
await Parser.init();
const language = await Language.load("grammars/mermaid.wasm");
const parser = new Parser().setLanguage(language);
const queries = Object.fromEntries(
  readdirSync("languages/mermaid")
    .filter((name) => name.endsWith(".scm"))
    .map((name) => [
      name,
      new Query(language, readFileSync(`languages/mermaid/${name}`, "utf8")),
    ]),
);
const highlights = queries["highlights.scm"];
after(() => {
  for (const query of Object.values(queries)) query.delete();
  parser.delete();
  dom.window.close();
  delete globalThis.window;
  delete globalThis.document;
});

for (const file of readdirSync("test/fixtures").filter((name) =>
  name.endsWith(".mmd"),
)) {
  test(`Mermaid 12 and Zed grammar: ${file}`, async () => {
    const source = readFileSync(`test/fixtures/${file}`, "utf8");
    const result = await mermaid.parse(source);
    assert.ok(result.diagramType, "Mermaid must accept the diagram");
    const tree = parser.parse(source);
    try {
      assert.equal(tree.rootNode.hasError, false, tree.rootNode.toString());
      const headers = tree.rootNode.descendantsOfType("diagram_type");
      assert.equal(
        headers.length,
        1,
        "The grammar must recognize the diagram header",
      );
      const captures = highlights.captures(tree.rootNode);
      assert.ok(
        queries["outline.scm"]
          .captures(tree.rootNode)
          .some(
            ({ name, node }) => name === "name" && node.id === headers[0].id,
          ),
        "Diagram must appear in the outline",
      );
      assert.ok(
        captures.some(
          ({ name, node }) => name === "type" && node.id === headers[0].id,
        ),
        "Diagram type must be highlighted",
      );
      // Compile and execute every query against realistic input.
      for (const query of Object.values(queries)) query.matches(tree.rootNode);
    } finally {
      tree.delete();
    }
  });
}

test("semantic highlights survive the grammar migration", () => {
  const cases = [
    [
      "flowchart LR\nblockArrow --> graphNode\n",
      [
        ["blockArrow", "variable"],
        ["graphNode", "variable"],
      ],
    ],
    [
      "flowchart LR\nA[Start] e1@--> B@{ shape: rect }\n",
      [
        ["A", "variable"],
        ["e1", "label"],
        ["-->", "operator"],
        ["@{ shape: rect }", "attribute"],
      ],
    ],
    [
      "sequenceDiagram\nparticipant Alice\nAlice->>Bob: Hello\nactivate Bob\n",
      [
        ["participant", "keyword"],
        ["Alice", "variable"],
        ["->>", "operator"],
        ["activate", "keyword"],
      ],
    ],
    [
      "classDiagram\nclass Animal {\n  +int age\n}\n",
      [
        ["Animal", "type"],
        ["age", "property"],
      ],
    ],
    [
      "erDiagram\nUSER {\n  int id PK\n}\n",
      [
        ["USER", "type"],
        ["id", "property"],
        ["PK", "constant"],
      ],
    ],
    [
      "usecase-beta\nactor Customer\nCustomer --> Login\n",
      [
        ["usecase-beta", "type"],
        ["actor", "keyword"],
        ["Customer", "variable"],
      ],
    ],
    [
      "agentflow-beta TB\nflow reviewer[Review]\ninput --> output\nend\n",
      [
        ["flow", "keyword"],
        ["reviewer", "type"],
        ["-->", "operator"],
      ],
    ],
  ];
  for (const [source, expected] of cases) {
    const tree = parser.parse(source);
    try {
      assert.equal(tree.rootNode.hasError, false, tree.rootNode.toString());
      const captures = highlights.captures(tree.rootNode);
      for (const [text, capture] of expected) {
        assert.ok(
          captures.some(
            ({ name, node }) => name === capture && node.text === text,
          ),
          `Missing ${capture} for ${text} in ${source}`,
        );
      }
    } finally {
      tree.delete();
    }
  }
});

test("front matter is exposed for Zed YAML injection", () => {
  const tree = parser.parse(
    "---\nconfig:\n  layout: elk\n---\nflowchart LR\nA --> B\n",
  );
  try {
    const captures = queries["injections.scm"].captures(tree.rootNode);
    assert.ok(
      captures.some(
        ({ name, node }) =>
          name === "injection.content" && node.text.includes("layout: elk"),
      ),
    );
  } finally {
    tree.delete();
  }
});

test("unknown syntax does not swallow the following diagram", () => {
  const tree = parser.parse(
    "flowchart LR\nfuture syntax @{ value: 42 }\nsequenceDiagram\nAlice->>Bob: Hello\n",
  );
  try {
    assert.deepEqual(
      tree.rootNode.descendantsOfType("diagram_type").map((n) => n.text),
      ["flowchart", "sequenceDiagram"],
    );
    assert.ok(
      highlights
        .captures(tree.rootNode)
        .some(({ name, node }) => name === "operator" && node.text === "->>"),
    );
  } finally {
    tree.delete();
  }
});
