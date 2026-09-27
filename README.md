# Project Dependency Map

Before changing a group of services, see which package depends on which and whether an install order is possible. This Node.js 24 tool reads a small package graph, reports missing names and cycles, and writes a JSON result plus a Mermaid diagram. All sample package names are fictional.

## Run

```powershell
node --test
node cli.mjs
node cli.mjs path/to/packages.json path/to/output-directory
```

Default files: [`fixtures/packages.json`](fixtures/packages.json), [`examples/graph.json`](examples/graph.json), and [`examples/graph.mmd`](examples/graph.mmd). The optional output directory is created and files with those names are overwritten. Paste `graph.mmd` into a Mermaid-compatible viewer, including GitHub Markdown, to see the graph. No npm dependencies are needed.

Input is an object mapping each package to an array of direct dependency names. Names start with a letter and may then contain letters, digits, `_`, and `-`; the diagram uses generated node IDs to keep reserved words such as `end` safe. Missing dependencies are reported; a cycle makes install order unavailable. This analyzes supplied project metadata; it does not inspect or install real packages.
