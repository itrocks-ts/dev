# Package boundaries

## Decision rule

Give a package one coherent responsibility and expose the smallest API required by its consumers. Keep reusable
domain and infrastructure packages independent from `@itrocks/framework`; the framework is the composition root,
not a dependency to import from lower layers.

## Runtime surfaces

- Put reusable server logic behind named exports and a package root or explicit subpath export.
- Keep browser code in browser-safe modules. Browser imports use explicit `.js` paths; they must not pull in Node.js
  APIs or CommonJS-only modules.
- Reserve side-effect modules such as `build.js` for registration or activation. Importing an ordinary API module
  should not unexpectedly start servers, observe the DOM, or mutate global registries.
- Author changes in TypeScript, HTML, and SCSS sources. Generated `cjs`, JavaScript, declaration, CSS, and copied asset
  outputs are build products; do not hand-edit them.
- Preserve an existing package's established layout unless the task includes a migration. For a new package, use the
  archetype and default `src/` layout in `package-structure-and-build.md`.

Backend packages commonly export a facade file that re-exports focused modules. Browser packages commonly expose
several explicit module paths so consumers can load only the needed behavior.

## Integration surface

A package may contribute declarative configuration such as routes, access rules, menus, container data, or compose
replacements. Keep that contribution additive and package-local. Put application overrides in the application
configuration rather than hard-coding them into the reusable package.

Dependencies should point toward contracts:

1. Domain classes and metadata packages define meaning.
2. Generic services define interfaces, registries, or abstract classes.
3. Adapters implement those contracts.
4. The framework binds implementations and starts the application.

## Implementation checklist

- Decide whether the package is server-only, browser-only, or has deliberately separated surfaces.
- Export symbols from a focused facade; use a subpath when importing the facade would load the wrong runtime.
- Put optional activation in an explicit initializer or side-effect build module.
- Add configuration only for integration data, not as a substitute for a typed code contract.
- Keep demos and tests outside the runtime entry path.
- Ensure the package build copies or compiles every runtime HTML, CSS, script, and referenced asset.

Reference implementations: `action/src/action.ts`, `framework/src/framework.ts`, `framework/src/front/app.ts`,
`list/src/front/build.ts`, and `auto-redirect/build.ts`.
