# Dependency composition

## Decision rule

Keep reusable packages operational with local defaults and bind framework-specific behavior explicitly at startup.
Use configuration composition only when an application must replace or augment an exported class.

## Function dependency injection

Packages that need behavior from a higher layer use this pattern:

```ts
export type Dependencies = {
	resolve: (value: string) => Result
}

const depends: Dependencies = {
	resolve: value => fallback(value)
}

export function featureDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}
```

Keep the dependency contract small, typed, and expressed in domain terms. Defaults must be deterministic and useful
for isolated tests. Group related bindings behind one initializer when consumers should not need to understand the
internal submodules.

When a dependency is fulfilled by an existing framework function, keep the dependency name, parameter meaning, and
parameter order identical to that function whenever the lower-level package has the required context. For example, a
package that knows a target and property should depend on `componentOf(target, property)` or
`requiredOf(target, property)`, not on a renamed predicate or a wrapper-specific argument. This lets the composition
root use `{ componentOf, requiredOf }` directly, keeps the concepts recognizable across packages, and avoids adapter
functions that only reshape an otherwise identical call. Introduce an adapter only when the values or semantics
actually differ.

The framework composition root performs binding before serving requests. Its observed order is: load layered
configuration, install configured export composition, bind dependencies and transformer registries, then start
servers. Avoid import-time reads that freeze configurable metadata before this sequence completes.

## Configuration and export composition

Configuration is merged in dependency order, then application files override or extend it. Package configuration is
appropriate for declarative contributions such as routes or menus. Relative paths belong to the configuration file
that declares them.

Use `config.compose` and `@itrocks/compose` when the selected implementation must remain import-compatible with an
existing export. A replacement may subclass the original; additional classes are applied as `@Uses` mixins. Keep
replacement chains short because their order affects method resolution and metadata.

Do not use export composition for ordinary function dependencies, and do not use the browser `Plugin<T>` mechanism
for server dependency injection. They solve different problems.

## Implementation checklist

- Put the abstraction in the lower-level package and the binding in the higher-level composition root.
- Export one clearly named `*DependsOn`, `set*Dependencies`, or `init*` entry point.
- Merge partial bindings without erasing defaults.
- Reuse the name and complete call signature of an existing function when it directly fulfills a dependency.
- Initialize registries once, before the first request or reflection-dependent operation.
- Use configuration for deployable selection; use direct initialization for code-level collaboration.
- Check ordering when two replacements, mixins, or registry initializers affect the same behavior.

Reference implementations: `class-view/src/class-view.ts`, `template/src/template.ts`,
`core-transformers/src/core-transformers.ts`, `framework/src/dependencies.ts`, `framework/src/framework.ts`,
`config/src/config.ts`, and `compose/src/compose.ts`.
