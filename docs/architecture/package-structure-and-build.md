# Package structure and build

## Default layout

For a new package, put authored runtime files in `src/`. Existing packages with root-level TypeScript are historical
or browser-publication variants; do not copy that layout by default. Use kebab-case filenames and keep one concern per
file.

```text
package/
├── src/
│   ├── package-name.ts       public facade or primary export
│   ├── focused-feature.ts
│   ├── view.html             when rendered by the backend
│   ├── feature.scss          when owned by this feature
│   └── front/                browser code of a mixed package only
├── test/                     tests and fixtures
├── config.yaml               declarative framework contribution, when needed
├── package.json
└── tsconfig.json
```

Use `index.ts` only when it is the intentional public entry name; otherwise name the facade after the package. Name
side-effect browser registration `build.ts` and transformer registration `transformers.ts`. Keep HTML, SCSS, SVG, and
other assets beside their owning source, then copy or compile them to the published location. Never edit generated
`cjs/`, `esm/`, `.js`, `.d.ts`, or `.css` files.

## Choose an archetype

| Package kind | Source and output | Reference packages |
|--------------|-------------------|--------------------|
| Backend library, domain model, decorator | `src/*.ts` -> `cjs/`; one root export, optional exported subpaths | `required`, `account`, `property-translate` |
| Backend action with HTML/SCSS | `src/*.ts` and HTML -> `cjs/`; SCSS and assets -> `css/` | `action`, `edit`, `save` |
| Mixed backend and browser | backend in `src/`, browser in `src/front/`; backend -> `cjs/`, browser/CSS/assets -> package root | `list`, `framework` |
| Browser-only modular package | modules in `src/`; compile as ES modules, then publish root `.js` and `.d.ts` subpaths | `xtarget`, `table` |
| CSS-only package | SCSS partials and entry files in `css/`; compile CSS in place | `ux-core` |
| Dependency bundle with no runtime API | no TypeScript or `tsconfig`; publish metadata, README, license, and dependencies only | `action-pack`, `business-pack`, `crud-pack` |

Use separate CJS and ESM builds only when consumers demonstrably require both. Follow `route` with a base
`tsconfig.json`, one config per output, and conditional `exports`; do not add a dual build speculatively.

## TypeScript configuration

For a normal backend package, start from `required/tsconfig.json`: declarations, strict checking, `module: nodenext`,
`rootDir: src`, `outDir: cjs`, source maps, consistent casing, and skipped library checking. Add:

- `types: ["node"]` only when Node.js globals or built-ins are used;
- `experimentalDecorators: true` only when the existing legacy property or parameter decorator APIs require it;
- `exclude: ["src/front"]` for a mixed package.

For the browser part of a mixed package, follow `list/src/front/tsconfig.json`: extend the package config, override
`module` to `esnext`, `target` to `es2022`, disable source maps, and emit to the intended public directory. For a
browser-only modular package, follow `xtarget/tsconfig.json` and use `@itrocks/prepare-module` when compiled subpaths
must be copied from `src/` to the package root.

Do not copy compiler options blindly. Start from the closest archetype, then remove options not required by the
package and run the build with the TypeScript version declared in that reference package.

## `package.json` and build

Start from the closest reference package and replace every identity value. A source package normally declares
`author`, `description`, `keywords`, `homepage`, `license`, scoped `name`, repository URL, `version`, `scripts`,
`files`, dependencies, and its public entry through `exports` or published browser subpaths. Follow the README
guidelines for `description` and `keywords`.

- Put imported runtime packages in `dependencies`; use `latest` for internal `@itrocks/*` dependencies. A package built
  on a standard stack may declare its documented pack instead: `business-pack` for domain models and `action-pack`
  for actions, while still importing APIs from their owning packages.
- Put TypeScript, Sass, Node types, test tools, and build-only helpers in `devDependencies`.
- Use `optionalDependencies` only when the package remains functional without the integration.
- Set `engines.node` to the current project baseline for backend or Node.js packages; omit it for browser/CSS-only
  packages unless their tooling is itself the published runtime.
- Start an unreleased new package at `0.0.1` unless the repository release process provides another version. Do not
  change an existing version as an incidental code change.
- Keep `license` consistent with `LICENSE`, use the `itrocks-ts/<package>` repository URL, and add `type` only when the
  chosen runtime deliberately requires Node.js ESM semantics.
- Use `exports: "./cjs/<entry>.js"` for one backend entry and an exports map for public subpaths. Publish only paths
  that exist after build.
- Make `files` a positive allowlist of README, license, configuration, and generated runtime artifacts. Exclude maps
  when they are not intentionally published.
- Compose `build` from named steps when several surfaces exist. Copy HTML and assets explicitly and compile SCSS with
  `--no-source-map`, following the selected archetype.
- Add `test: "npm run build && node --test --test-isolation=none test/*.test.js"` when the package has Node tests.

Whenever a public file moves or a surface is added, update source layout, `tsconfig`, build scripts, `exports`,
`files`, dependencies, `.gitignore`, README examples, and tests as one change.

## Validation

Run `npm run build`, then verify that every export and referenced HTML, CSS, script, and asset exists in its published
location. Run tests and `npm pack --dry-run` when available; the pack listing must contain runtime outputs and exclude
source-only, demo, test, map, and local files unless deliberately published.
