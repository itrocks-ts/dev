# Requests, actions, and routes

## Decision rule

Put transport-neutral HTTP data in `request-response`, application URL interpretation in `action-request`, and use
an `Action` class when one operation supports response formats or participates in the action workflow.

## Request pipeline

The server pipeline is:

1. The server adapter creates a generic `Request` with method, URL parts, headers, parameters, data, session, and raw
   transport object.
2. `action-request.Request` parses `/route[/ids][/action][/format]`, negotiates a default format, resolves the domain
   type, and lazily loads requested objects.
3. The route repository resolves `route/action` to a function or class.
4. An action class method named after the format (`html`, `json`, and so on) executes.
5. The result becomes a generic `Response` carrying body, status, and headers.

The default domain mapping is REST-like: collection `GET` selects `list`, identified `GET` selects `output`, `POST`
selects `save`, and `DELETE` selects `delete`. Declare explicit routes when that convention does not describe the
operation.

## Route and action contracts

- Contribute runtime destinations through package configuration. A destination is a module path with an optional
  `:ExportName`.
- Use `@Route` on reusable action classes to give them route identity for links and static route tooling.
- Extend `Action<T>` for format-specific operations. Return `htmlResponse`, `htmlTemplateResponse`, or `jsonResponse`
  rather than a server-adapter response.
- Use `@Need('object', alternative)` or `@Need('Store', alternative)` for structural prerequisites. Authorization and
  business validation remain explicit logic.
- Load entities through the action request or `DataSource`; do not parse identifiers again inside each action.

Action availability and action navigation are separate. `@Actions` declares available operation names.
`ActionFlow(from, to, definition)` and the action repository describe which UI action links are offered from another
action, including caption, target, CSS, and template. They do not register HTTP routes.

## Implementation checklist

- Decide whether the endpoint is conventional CRUD or needs its own route.
- Keep one action method per supported output format and share domain work below those methods.
- Use the request's resolved type so composed domain classes continue to work.
- Return response abstractions and keep Fastify-specific code in the server adapter.
- Add action-flow metadata only when the operation should be discoverable in generated UI.
- Check missing object, missing store, multiple identifiers, content negotiation, and error status behavior.

Reference implementations: `action-request/src/action-request.ts`, `route/src/routes.ts`, `action/src/action.ts`,
`action/src/repository.ts`, `list/src/list.ts`, and `framework/src/main.ts`.
