# Domain model and metadata

## Decision rule

Represent domain data with plain classes and express cross-cutting semantics with focused decorators. Consumers must
discover the model through `ReflectClass` and `ReflectProperty`, not through duplicated field lists.

## Model shape

- Declare persisted or rendered properties as explicit TypeScript fields with explicit types.
- Give discoverable fields an initializer when a meaningful default exists. Reflection reads defaults from source and
  property types from generated declarations.
- Keep the zero-argument construction path usable. `ReflectClass.propertyNames` instantiates the class; if construction
  throws, no property names are discovered.
- Use normal inheritance for an `is-a` relationship. Framework reflection merges inherited metadata.
- Use `@Uses(...mixins)` for orthogonal reusable components. The generated declaration support makes mixed-in members
  visible to TypeScript, while framework reflection includes their property types.

Domain instances do not declare a storage identifier. Persistence connects them as `Entity<T>` at runtime.

## Decorator pattern

A metadata package normally owns:

1. a module-private `Symbol` key;
2. a PascalCase decorator that writes metadata through `@itrocks/decorator/class` or
   `@itrocks/decorator/property`;
3. a lower-camel accessor ending in `Of` that supplies the default and inheritance behavior.

Use class decorators for class-wide semantics such as `@Store`, `@Representative`, or `@Actions`. Use property
decorators for constraints and presentation semantics such as `@Required`, `@Length`, or `@Display`.

Do not make decorators perform application startup. A decorator may register metadata or a transformer for its
target, but global dependencies and adapters are initialized at the composition root.

## Reflection constraints

- Property type inspection depends on a readable `.d.ts` next to the runtime module.
- Default inspection depends on the corresponding TypeScript source being available in the package layout.
- Imported model types may be resolved lazily to tolerate module cycles.
- Reflection values are cached on first access. Complete bootstrap binding before first use when metadata defaults
  depend on injected functions.
- Use `ReflectProperty.collectionType` only after confirming that the property is a collection.

## Implementation checklist

- Model the property once in the class, then attach narrowly scoped decorators.
- Add a new decorator package only when the semantic is reusable and has a consumer.
- Implement both the decorator and its query accessor with defined fallback behavior.
- Verify inheritance, optionality, collection element types, and defaults through reflection.
- Keep display, transformation, and database behavior in their respective consumer layers.

Reference implementations: `user/src/user.ts`, `decorator/src/class.ts`, `decorator/src/property.ts`,
`reflect/src/class.ts`, `property-type/src/property-type.ts`, and `uses/src/uses.ts`.
