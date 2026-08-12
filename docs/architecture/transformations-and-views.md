# Transformations and views

## Decision rule

Use the transformer registry whenever a property value crosses a representation boundary. Use view metadata to
choose what is shown; do not mix display policy into storage adapters or HTML templates.

## Transformer matrix

A transformer is selected by two axes:

- format, such as `HTML` or `SQL`;
- direction, such as `EDIT`, `INPUT`, `OUTPUT`, `READ`, or `SAVE`.

Resolution is property-specific first, then property-type-specific, then `ALL`. The registry also supports an empty
format or direction as a fallback. Property-type lookup understands canonical types, domain types, collections, and
their base types.

Register a transformer with `@Transform`, `setPropertyTransformer`, or `setPropertyTypeTransformer`. Return `IGNORE`
when a pipeline must leave the target property untouched. Do not encode this condition as `undefined`, because
`undefined` may be a legitimate transformed value.

The main flows are:

- HTML form data -> `HTML`/`INPUT` -> domain property through `dataToObject`;
- domain property -> `HTML`/`EDIT` or `HTML`/`OUTPUT` through framework `ReflectProperty`;
- database row -> `SQL`/`READ` -> domain property;
- domain property -> `SQL`/`SAVE` -> database value.

Keep the transformer pure when practical. When it needs collaboration, define a small dependency contract and bind
it during framework initialization. Register format-level post-processing, such as mandatory HTML containers, only
for behavior shared by every transformer in that format.

## View metadata

- `@Display` controls human-readable class or property names.
- `@DisplayOrder` controls property ordering in detailed views.
- `@List` controls properties in collection views.
- `@Representative` selects properties used to identify an object in links and summaries.

Defaults are reflection-based and inherited. Add explicit metadata only when the default is wrong. Templates should
consume `ReflectClass`, `ReflectProperty`, and decorated helpers such as `@display` or `@output` instead of rebuilding
labels and formatting rules.

## Implementation checklist

- Name the source format and direction before adding conversion code.
- Prefer a property-type transformer when all properties of that type share the rule.
- Prefer a property transformer for an exceptional field.
- Register transformers in an explicit initializer and call it from the composition root.
- Test fallback precedence, asynchronous values, optional values, collections, and `IGNORE`.
- Keep a single display and representative policy usable by HTML, lists, routes, and schema indexes.

Reference implementations: `transformer/src/transformer.ts`, `data-to-object/src/data-to-object.ts`,
`core-transformers/src/core-transformers.ts`, `framework/src/reflect-property.ts`, `property-view/src/property-view.ts`,
and `class-view/src/representative.ts`.
