# Framework reuse and extension choices

## Decision rule

Search the existing `@itrocks` packages before implementing infrastructure. Reuse the narrowest public contract that
already owns the behavior. New code should normally express domain meaning or adapt an existing extension point, not
create a parallel routing, rendering, storage, or browser pipeline.

## Find the existing owner

| Need | Reuse first |
|------|-------------|
| Domain type inspection and defaults | `reflect`, `property-type`, `property-default`, `class-type` |
| Reusable domain semantics | existing decorators; otherwise the `decorator` class/property helpers |
| Inheritance-independent class composition | `uses`; application export replacement through `compose` |
| Display, representative, ordered, or list properties | `class-view`, `property-view`, `list-properties` |
| Input, edit, output, read, or save conversion | `transformer`, `core-transformers`, `data-to-object` |
| HTTP transport values and responses | `request-response`, `core-responses` |
| Application request parsing, routes, and operations | `action-request`, `route`, `action` |
| Server-rendered HTML and reflected expressions | `template`, normally through `template-insight` |
| Storage access and database-neutral schema | `storage`, `store`, `schema`; adapters such as `mysql` stay outside domain code |
| Initial and dynamically inserted DOM activation | `build` |
| Partial navigation, forms, DOM targets, and head assets | `xtarget`, `form-fetch`, `asset-loader` |
| Optional extensions around a browser host | `plugin` with `HasPlugins` and `Plugin<T>` |
| Shared application layout and common widgets | `ux-core`, `action-bar`, `notifications`, `table`, and existing focused UI packages |

Inspect the candidate package's exports, README, source, and tests before depending on it. Import its public package
entry or exported subpath, never another package's private `src/` or generated internal path.

Use `business-pack` as the dependency baseline for a package defining domain objects and `action-pack` for a package
defining actions and views. Import concrete APIs from their owning packages even when a pack supplies them. Use
`crud-pack` when the consumer needs the standard CRUD implementations. Outside a documented pack, declare each
runtime owner directly; do not rely on accidental transitive dependencies.

## Choose the extension mechanism

Use the smallest mechanism that preserves dependency direction:

| Situation | Mechanism |
|-----------|-----------|
| Declarative fact about a class or property | Focused decorator plus an `*Of` reader |
| Value crossing a representation boundary | Transformer registration |
| Reusable low-level package needs behavior owned by a higher layer | Typed `Dependencies`, safe defaults, and `*DependsOn()` binding |
| Several interchangeable stateful infrastructure implementations | Abstract port such as `DataSource`, implemented by adapters and selected at bootstrap |
| One-time registry or application wiring | Explicit `init*`, `set*`, or side-effect `build` module |
| Optional ordered behavior around a browser host | `Plugin<T>` configured where the host is constructed |
| Application must replace or augment an exported class globally | Configuration plus `compose`/`Uses` at the composition root |

Use a direct import when the dependency is already a stable lower-level contract. Do not add `DependsOn` merely to
avoid an ordinary dependency. Use it when a direct import would point from reusable core code toward framework,
application, adapter, or presentation code, or would create a cycle.

## Hexagonal dependency rule

Domain and reusable core packages must not import `framework` or a concrete database/server adapter. Define the port
where it is consumed, in domain terms. Provide deterministic local defaults for function dependencies, and bind real
implementations in the framework or application bootstrap before first use. Concrete adapters import and implement
the port; the port never imports its adapters.

Keep `DependsOn` contracts narrow: inject functions or minimal types actually used, group related bindings once, and
merge partial bindings without removing defaults. For stateful lifecycles or multiple implementations, prefer an
abstract class/interface port and explicit construction over a bag of callbacks.

## Autonomous implementation checklist

Before creating a new abstraction or utility:

1. Search package names, public exports, READMEs, and source for the capability and its synonyms.
2. Select the existing owner from the table and read its architecture document.
3. Prefer metadata, transformers, actions, templates, `build()`, or plugins over a parallel mechanism.
4. Check dependency direction; introduce `DependsOn` or a port only at an inward-facing boundary.
5. Add the appropriate dependency pack or narrow runtime dependency and initialize the extension at the existing
   composition point.
6. Implement a new package-level abstraction only when no existing public contract fits; document why its owner and
   layer are distinct.

Reference implementations: `framework/src/dependencies.ts`, `core-transformers/src/core-transformers.ts`,
`action-request/src/action-request.ts`, `storage/src/data-source.ts`, `framework/src/front/app.ts`, and
`xtarget/src/xtarget.ts`.
