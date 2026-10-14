# Dependency audit

Run this audit from an application containing local `@itrocks/*` source checkouts. An npm distribution without sources
allows only a partial audit; report the missing coverage. Install `@itrocks/dev` with `npm i --save-dev @itrocks/dev`
to make this guide available in the application.

Consider a full audit before a major release, or whenever the developer requests it. Routine package edits do not
require a full audit.

Give an agent this request:

```text
Read node_modules/@itrocks/dev/docs/dependency-audit.md and run its audit procedure on all local @itrocks/* packages.
Report remaining dependency and TypeScript configuration issues. Do not apply corrections.
```

## Audit procedure

Use Node scripts in `<application-root>/tmp/` for discovery, syntax extraction and manifest comparisons.
Save structured results there and
inspect only summaries, candidates and ambiguous references manually. Use an available AST parser; check its actual API
before scripting it. Do not assume that the installed TypeScript package exposes createSourceFile.

1. Read applicable agent instructions and package conventions. Inventory every immediate `node_modules/@itrocks/*`
   package with a manifest, including documentation, CSS and dependency bundles. Preserve all existing changes.
2. Scan authored TS/TSX/MTS/CTS and JS/JSX/MJS/CJS, including tests, demos and handwritten declarations. Exclude nested
   dependencies, Git data, maps and generated files. Identify outputs from build configurations and source counterparts;
   do not exclude directories named `cjs` or `esm` blindly: `app-dir` authors TypeScript there.
3. Extract imports, re-exports, side-effect imports, import types, import-equals, literal `import()`, `require()` and
   `require.resolve()`. Normalise subpaths to package names. Exclude self-imports and Node built-ins. Resolve relative
   paths crossing package boundaries; retain file, line, reference and source/test/build classification for each use.
   Record computed imports separately for targeted review instead of guessing their package names.
4. Extract cross-package references from HTML links, scripts and template includes, SCSS imports/use/forward,
   configuration bindings, asset URLs, dynamic loaders and npm scripts. Account for published browser paths, build-time
   copies and relative paths rewritten during publication. Distinguish actual uses from comments, README examples and
   fictitious fixtures such as prepare-module/sub/demo.js.
5. Compare uses against dependencies, devDependencies, optionalDependencies and peerDependencies separately. Report
   missing declarations, runtime imports listed only for development, build/test tools listed as runtime dependencies,
   unused declarations in every section and contradictory duplicate classifications. Published CLIs have runtime
   dependencies even when their purpose is development. Imports used only for types still need a declaration; determine
   whether consumers need those types through published declarations before choosing development dependencies.
6. Review candidates against sources, scripts, configurations and package contracts. Dependencies used by a compiler,
   CLI, typings, CSS, fonts or asset loader do not need a JS import. Treat metadata-only bundles as intentional.
   For action-pack/business-pack, verify whether project conventions or the documented bundle contract permit imports
   from their member packages, then check the current bundle manifest and report that coverage explicitly. Ordinary
   transitive dependencies and application-level hoisting do not replace a package's own declaration. Optional entries
   must support optional integrations; distinguish a separate integration entry from an unavoidable eager import.
7. Inspect every tsconfig, including inherited and browser/test configurations, and all @types declarations. For Node,
   check built-in imports, require, __dirname, __filename, process, Buffer, NodeJS and other Node globals; distinguish
   locally declared identifiers and browser APIs. Include TypeScript tests; JS-only tests and inline JS build scripts
   do not themselves require @types/node. Check types: ["node"] and flag lib: ["node"] as invalid: lib contains standard
   language/DOM libraries, whereas Node declarations come from @types/node. Flag missing Node typings and configurations
   requesting unused typings. Check inherited Node types in browser configurations separately from backend needs.
8. Validate proposed typing removals with the installed compiler and temporary configurations extending the original,
   with noEmit: true and types: [] (retaining other required ambient types). Inspect --listFiles to confirm
   @types/node was not reintroduced transitively. Record failures and their owning sources: a package without direct
   Node use can still compile imported checkout sources that need Node types. Do not delete packages to perform this
   check. Re-run focused comparisons and relevant type checks after any user corrections.
9. Report package and configuration counts, coverage limitations, a concise remaining-issues table with file/line
   evidence and suggested declaration changes, and a per-package status in a structured report. Distinguish confirmed
   issues, intentional bundle/asset/tool uses and unresolved dynamic cases. State checks actually run; a static audit
   or successful compilation with hoisted dependencies does not prove an isolated installation works. Leave manifests,
   sources, generated outputs and lockfiles unchanged unless corrections are requested.

The scripts should collect evidence rather than issue automatic removals. Review ambiguous cases before presenting
them as problems. Put scripts, temporary configurations and reports in `<application-root>/tmp/`, with report names
such as `audit-itrocks-dependencies.json` and `audit-itrocks-dependencies.txt`. Do not write audit files directly in
the application root or package source trees. Honour an explicitly requested output destination.
