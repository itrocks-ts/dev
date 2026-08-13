# it.rocks package instructions

This file is generated from `dev/AGENTS.@itrocks.md` by the `@itrocks/dev`
build. Edit the source file, not the generated `AGENTS.md` in the `@itrocks`
directory.

## Development guidelines

The documents below contain task-specific instructions. Read the applicable
document completely before starting the corresponding work, then follow it for
every affected package.

| Task                                                             | Required document                           |
|------------------------------------------------------------------|---------------------------------------------|
| Create or update JavaScript, TypeScript, HTML, or SCSS source    | `dev/docs/coding-conventions.md`            |
| Create or update any Markdown documentation                      | `dev/docs/documentation-guidelines.md`      |
| Create or update a package `README.md` or `docs/dependencies.md` | Documentation guidelines; README guidelines |
| Update `package.json` description or keywords                    | `dev/docs/README-guidelines.md`             |
| Create a new it.rocks package                                    | All applicable development guidelines below |

For a new package, read the coding, documentation, and README guidelines, followed by
`dev/docs/architecture/package-structure-and-build.md`, `dev/docs/architecture/package-boundaries.md`, and
`dev/docs/architecture/framework-reuse.md`; then route remaining decisions below.

Treat a package's `README.md`, `package.json.description`, and
`package.json.keywords` as one documentation surface. Update and validate them
together as required by the guideline.

## Architecture routing

Read an architecture document before making the corresponding architectural
decision. A local implementation change that preserves the listed contracts
does not require architecture reading.

Document paths in the table are relative to `dev/docs/architecture/`. The `index` entry means
`dev/docs/architecture.md`.

| Decision                                            | Required document                      |
|-----------------------------------------------------|----------------------------------------|
| Multiple architectural surfaces                     | `index`, then only its selected files  |
| Files, naming, package metadata, outputs, or build  | `package-structure-and-build.md`       |
| Package responsibility, public API, or activation   | `package-boundaries.md`                |
| Reuse, new abstraction, port, or `DependsOn`        | `framework-reuse.md`                   |
| Domain class, decorator, reflection, or inheritance | `domain-model-and-metadata.md`         |
| Dependency binding, configuration, or bootstrap     | `dependency-composition.md`            |
| Request, route, action, response, or action flow    | `requests-actions-and-routes.md`       |
| Property conversion, transformer, or view metadata  | `transformations-and-views.md`         |
| Server template, include, fragment, or DOM target   | `html-templates-and-targets.md`        |
| Browser activation, dynamic DOM, navigation, plugin | `browser-components.md`                |
| SCSS contract, UI state, or packaged visual asset   | `scss-and-assets.md`                   |
| Storage, data source, relation, schema, or adapter  | `persistence-and-schema.md`            |
