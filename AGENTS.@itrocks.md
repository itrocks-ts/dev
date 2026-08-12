# it.rocks package instructions

This file is generated from `dev/AGENTS.@itrocks.md` by the `@itrocks/dev`
build. Edit the source file, not the generated `AGENTS.md` in the `@itrocks`
directory.

## Development guidelines

The documents below contain task-specific instructions. Read the applicable
document completely before starting the corresponding work, then follow it for
every affected package.

| Task | Required document |
|------|-------------------|
| Create or update JavaScript, TypeScript, HTML, or SCSS source | `dev/docs/coding-conventions.md` |
| Create or update a package `README.md` | `dev/docs/README-guidelines.md` |
| Write or update `package.json.description` or `package.json.keywords` | `dev/docs/README-guidelines.md` |
| Create a new it.rocks package | Coding conventions; README guidelines; `dev/docs/architecture/package-structure-and-build.md`; `dev/docs/architecture/package-boundaries.md`; `dev/docs/architecture/framework-reuse.md`; then route remaining decisions below |

Treat a package's `README.md`, `package.json.description`, and
`package.json.keywords` as one documentation surface. Update and validate them
together as required by the guideline.

## Architecture routing

Read an architecture document before making the corresponding architectural
decision. A local implementation change that preserves the listed contracts
does not require architecture reading.

| Decision | Required document |
|----------|-------------------|
| Change several architectural surfaces or decide which documents apply | `dev/docs/architecture.md`, then only the documents it selects |
| Change file placement, naming, `package.json`, `tsconfig`, outputs, or build | `dev/docs/architecture/package-structure-and-build.md` |
| Change package responsibility, public/runtime surface, or activation boundary | `dev/docs/architecture/package-boundaries.md` |
| Choose between existing components, a new abstraction, a port, or `DependsOn` | `dev/docs/architecture/framework-reuse.md` |
| Change a domain class, decorator, reflection contract, inheritance, or mixin | `dev/docs/architecture/domain-model-and-metadata.md` |
| Change dependency binding, configuration contribution, bootstrap, or export composition | `dev/docs/architecture/dependency-composition.md` |
| Change a request, route, action, response format, prerequisite, or action flow | `dev/docs/architecture/requests-actions-and-routes.md` |
| Change property conversion, transformer selection, or reflected view metadata | `dev/docs/architecture/transformations-and-views.md` |
| Change a server-rendered HTML template, include, fragment, or DOM target contract | `dev/docs/architecture/html-templates-and-targets.md` |
| Change browser activation, dynamic DOM behavior, client navigation, or a `Plugin<T>` host | `dev/docs/architecture/browser-components.md` |
| Change SCSS selector contracts, UI state styling, or packaged visual assets | `dev/docs/architecture/scss-and-assets.md` |
| Change storage opt-in, data-source behavior, relations, schema conversion, or a database adapter | `dev/docs/architecture/persistence-and-schema.md` |
