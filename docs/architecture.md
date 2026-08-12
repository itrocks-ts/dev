# Architecture decision guide

Use this index when a change creates, removes, or moves a responsibility, or changes how a package integrates with
the rest of it.rocks. Read only the documents selected by the decision at hand. Read several when a change crosses
several boundaries.

In this guide, *package* means a published `@itrocks/*` module. The word *plugin* means such an integration package
unless `HasPlugins` or `Plugin<T>` is named explicitly; those names refer to the browser-side extension mechanism.

| Decision | Read |
|----------|------|
| New package, file placement, naming, `package.json`, `tsconfig`, outputs, or build | [`architecture/package-structure-and-build.md`](architecture/package-structure-and-build.md) |
| Package responsibility, public entry point, server/browser split, or build-side registration | [`architecture/package-boundaries.md`](architecture/package-boundaries.md) |
| Existing component search, reuse versus creation, extension mechanism, port, or `DependsOn` decision | [`architecture/framework-reuse.md`](architecture/framework-reuse.md) |
| Domain class, property, decorator, reflection, inheritance, or `@Uses` mixin | [`architecture/domain-model-and-metadata.md`](architecture/domain-model-and-metadata.md) |
| Dependency inversion, bootstrap wiring, configuration contribution, export replacement, or composition root | [`architecture/dependency-composition.md`](architecture/dependency-composition.md) |
| URL, route, request parsing, action, response format, prerequisite, or action flow | [`architecture/requests-actions-and-routes.md`](architecture/requests-actions-and-routes.md) |
| Input/edit/output/storage conversion, transformer, display, list, or representative value | [`architecture/transformations-and-views.md`](architecture/transformations-and-views.md) |
| HTML data context, expression, include, block, fragment, container, head asset, or DOM target | [`architecture/html-templates-and-targets.md`](architecture/html-templates-and-targets.md) |
| Browser activation, dynamic DOM, `build()`, `HasPlugins`, `Plugin<T>`, or client-side navigation | [`architecture/browser-components.md`](architecture/browser-components.md) |
| Semantic selector, UI state class, layout stylesheet, action icon, or packaged visual asset | [`architecture/scss-and-assets.md`](architecture/scss-and-assets.md) |
| Storage opt-in, data-source API, relation ownership, schema model, or database adapter | [`architecture/persistence-and-schema.md`](architecture/persistence-and-schema.md) |

For a new package, read package structure and build, package boundaries, and framework reuse first. Then read only
the documents for the surfaces it implements. For a local implementation change that preserves all contracts, the
coding conventions are usually sufficient.

When several designs are possible, prefer the one that keeps the domain package independent, exposes the smallest
stable contract, and moves application-specific binding to the composition root.
