# Browser components

## Decision rule

Enhance server-rendered semantic HTML after insertion. Register behavior by selector with `build()` when it must also
apply to future fragments. Use `HasPlugins` and `Plugin<T>` only when one browser feature needs ordered, optional
extensions around a stable host API.

## DOM activation

`build()` applies a callback to matching elements already in `document.body` and observes later inserted nodes. It can
also register an event listener with a priority. Put registrations in an explicit browser build module and import
that module for its side effect from the application browser entry point or a template dependency.

- Select elements through semantic elements, classes, and `data-*` contracts emitted by templates.
- Make activation safe against duplicate registration when an element can be moved or reinserted. Guard at the host
  element when the underlying component does not already do so.
- Dynamically import optional or heavy behavior inside the callback. Keep the selector registration lightweight.
- Import browser package subpaths with explicit `.js` extensions.
- Keep behavior in TypeScript, structure in HTML, and visual state in SCSS. TypeScript may toggle documented classes
  and data attributes shared with CSS.

## Extensible hosts

A host extends `HasPlugins<Host>`, accepts `Partial<Options<Host>>`, then calls `constructPlugins()` followed by
`initPlugins()` after its own base state exists. Options may contain plugin classes or configured plugin instances.

A plugin extends `Plugin<Host, PluginOptions>`. During construction it receives `of`, the host. Put wrapping and event
setup in `init()` unless an earlier lifecycle is explicitly defined. When wrapping a host method:

1. save the current method;
2. replace it with a normal function when dynamic `this` is required;
3. call the saved method with the host receiver;
4. preserve its return value and asynchronous behavior.

Plugin order is architectural: each plugin wraps the behavior installed before it. Configure the order at the
composition point and avoid plugins that silently depend on an unnamed neighbor. Pass a plugin instance when it needs
non-default options; pass its class when defaults are sufficient.

## Partial navigation

`XTarget` intercepts eligible links and forms, fetches their response, and updates a target. Its plugins handle
fragment extraction, multiple targets, head assets, history, modifiers, and other policies. Extend those policies with
an `XTarget` plugin rather than adding a second navigation pipeline.

## Implementation checklist

- Choose plain `build()` for independent enhancement and `Plugin<T>` for host extension.
- Initialize the host completely before plugin initialization.
- Define ordering and cleanup for listeners or generated styles.
- Verify initial DOM, dynamically inserted DOM, repeated insertion, and failed fetches.
- Preserve native links and forms when JavaScript is absent.

Reference implementations: `build/build.ts`, `framework/src/front/app.ts`, `plugin/plugin.ts`, `xtarget/src/xtarget.ts`,
`xtarget/src/history.ts`, `table/src/table.ts`, and `list/src/front/build.ts`.
