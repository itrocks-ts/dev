# Persistence and schema

## Decision rule

Keep domain classes persistence-ignorant. Opt a type into storage with metadata, access it through `DataSource`, and
keep reflection-to-schema, database introspection, schema comparison, and SQL generation as separate stages.

## Storage contract

- Use `@Store()` to opt a domain class into persistence. Supply a name only when the naming convention is wrong; use
  `@Store(false)` to opt out explicitly.
- Treat stored instances as `Entity<T>` only at the persistence boundary. The `id` is attached by the data source and
  is not a domain field.
- Depend on the abstract `DataSource` API for count, read, search, save, delete, and collection operations.
- Select the concrete engine from configuration with `createDataSource`. Do not instantiate the MySQL adapter in
  actions or domain classes.
- Pass query behavior through typed options such as limit and sort rather than leaking adapter SQL into callers.

Collections of stored objects use relation operations and identifiers. `@Component` marks owned component data;
`@Composite` identifies the back-reference on the component side. Decide ownership explicitly because it changes
loading, saving, deletion, and edit rendering.

## Schema pipeline

The schema layers have distinct responsibilities:

1. `ReflectClass` and metadata describe the TypeScript model.
2. `reflect-to-schema` converts stored classes to database-neutral `Database`, `Table`, `Column`, `Index`, and `Type`
   objects.
3. A database introspector such as `mysql-to-schema` converts an existing database to the same neutral model.
4. `schema-diff` compares neutral models.
5. A dialect adapter such as `schema-to-mysql` renders SQL.

Keep naming conversion, former names, length/range/precision, optionality, representative indexes, and relation
metadata in the reflection conversion layer. Keep SQL spelling and dialect limits in the dialect layer.

Database value conversion belongs to the `SQL` transformer matrix: `READ` when hydrating and `SAVE` when persisting.
This keeps the adapter generic and lets property packages provide their own representation.

## Implementation checklist

- Decide whether the class is stored, embedded as a component, or not persistent.
- Keep domain property types and metadata complete enough for reflection.
- Use `DataSource` from actions and services; add adapter methods only when the abstraction itself needs them.
- Add a neutral schema concept before adding dialect-specific rendering for it.
- Test new and existing entities, optional values, relations, collection diffs, and read/save transformer symmetry.
- Verify migrations preserve former names and representative indexes.

Reference implementations: `storage/src/data-source.ts`, `store/src/store.ts`, `mysql/src/mysql.ts`,
`reflect-to-schema/src/to-table.ts`, `reflect-to-schema/src/to-column.ts`, `schema/src/table.ts`, and
`schema-to-mysql/src/schema-to-mysql.ts`.
