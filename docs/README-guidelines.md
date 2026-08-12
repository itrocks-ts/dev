# Package README guidelines

Package README files are user documentation. They must let a developer quickly
understand what a package does, decide whether it fits their need, install it,
and use its public surface correctly.

Write documentation in English and describe the package as it exists now.
Prefer a short, accurate README to a long document padded with generic content.

## Standard opening

Start every README with these five badges, replacing `<package>` with the
unscoped package name:

```markdown
[![npm version](https://img.shields.io/npm/v/@itrocks/<package>?logo=npm)](https://www.npmjs.org/package/@itrocks/<package>)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/<package>)](https://www.npmjs.org/package/@itrocks/<package>)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/<package>?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/<package>)
[![issues](https://img.shields.io/github/issues/itrocks-ts/<package>)](https://github.com/itrocks-ts/<package>/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# <package>

<package.json.description>.
```

Use the unscoped package name as the single level-one heading. Immediately
follow it with the canonical package description from `package.json`. The
wording must be identical; only append the full stop that turns the description
into a sentence in the README. Do not add Markdown formatting inside this first
sentence because it would make the two descriptions diverge.

Start the description with the capability, not with project history or a
generic phrase such as “A useful library”. Good descriptions use direct
formulations such as “Transforms…”, “Provides…”, “Downloads…”, or “Marks…”.

When a boundary is essential to choosing the package, state it here too. For
example, say that a domain model does not perform transport, or that a bundle
does not expose a runtime API. Put this additional information in a second
sentence or paragraph so the canonical first sentence stays unchanged.

## Package metadata

Writing or revising a README also requires reviewing the `description` and
`keywords` fields in `package.json`. Treat these files as one documentation
change: do not leave package metadata inconsistent with the README.

### Description

Write one canonical description, then use it in both places:

- `package.json.description` contains the description without a trailing full
  stop;
- the first sentence after the README title reproduces that value
  character-for-character and adds only the trailing full stop;
- any qualification, boundary, or second capability follows in a separate
  sentence and is not part of `package.json.description`.

For example:

```json
{
  "description": "Transforms model objects to and from storage systems"
}
```

```markdown
# storage

Transforms model objects to and from storage systems.
```

To generate the description, inspect the package's public exports, source, and
existing tests before writing it. Express the primary user-visible capability
in one concise phrase. The description must:

- stand on its own in npm and search results;
- identify the concrete subject or result, such as model objects, file inputs,
  decorators, routes, or SQL queries;
- mention a defining environment or constraint only when it distinguishes the
  package, such as Node.js, MySQL, HTML, or runtime reflection;
- use present tense for a library capability (`Transforms`, `Provides`,
  `Marks`) and an imperative form only for a command whose purpose is naturally
  expressed that way (`Prepare`);
- avoid the package name, `@itrocks`, version claims, “new”, “simple”, “useful”,
  and other non-informative or temporary marketing language;
- avoid listing secondary features that belong later in the README.

When changing an existing description, search for the previous wording in both
files and update both occurrences in the same change. Never paraphrase the
description when copying it into the README.

### Keywords

Set `package.json.keywords` to a JSON array of unique search terms that describe
what the package actually provides. Derive them from the implementation and the
finished README, not from the package name alone.

Select keywords from the applicable categories:

- the core domain and concepts: `storage`, `entity`, `decorator`, `reflection`;
- the main operations or results: `transform`, `validation`, `routing`,
  `download`;
- the runtime or platform: `backend`, `front-end`, `browser`, `node`, `cli`;
- relevant technologies or standards: `typescript`, `html`, `sql`, `mysql`,
  `i18n`;
- established architectural terms: `AOP`, `CRUD`, `ORM`, `SPA`;
- the ecosystem keyword `it.rocks` for packages tied to the it.rocks framework.

Use about 7 to 15 keywords for a focused package. A broad dependency bundle may
need more because its constituent capabilities are themselves useful search
terms; a narrow package may need fewer. Quality and relevance take precedence
over reaching a target count.

Use lowercase except for established case-sensitive names and acronyms. Use the
normal spelling developers search for, including a hyphen or space for a
recognized compound term where appropriate. Include singular and plural forms
only when both are independently useful search terms. Sort the final array
alphabetically, case-insensitively.

Do not include:

- duplicates;
- vague terms such as `library`, `tool`, `code`, `easy`, or `fast` without a
  concrete search meaning;
- unrelated technologies merely used internally to implement the package;
- names of every dependency;
- capabilities that are planned but not implemented;
- spelling variants added only to inflate the list.

Example:

```json
{
  "description": "Transforms model objects to and from storage systems",
  "keywords": [
    "access",
    "backend",
    "CRUD",
    "data",
    "entity",
    "it.rocks",
    "mapper",
    "mapping",
    "ORM",
    "query",
    "source",
    "storage"
  ]
}
```

After editing, parse `package.json` to validate its JSON syntax and check that
the keywords are unique and sorted. Revisit both fields whenever the package's
main responsibility changes.

## Recommended structure

After the opening, choose only the sections the package needs. This is the
usual reading order:

1. `Requirements` for runtime, platform, compiler, or project prerequisites.
2. `Installation` with the exact npm command.
3. `Overview` or `Core idea` when users need a mental model before writing code.
4. `Usage` or `Basic usage` with the smallest useful working example.
5. Feature, component, command, or behaviour sections.
6. `API` for the public programmatic interface.
7. Operational sections such as `Limitations`, `Common mistakes`, `Browser support`,
   or `Troubleshooting`.

Do not add an empty section merely to match this order. A package that only
provides types, decorators, or metadata may need only a description and
installation instructions. Conversely, a package with non-obvious lifecycle or
configuration rules should explain those rules before its API reference.

Use sentence case for headings. Keep heading levels hierarchical: package name
at level one, main sections at level two, and individual API entries or examples
at level three. Do not add a table of contents unless the document becomes hard
to navigate without one.

## Requirements and installation

Document requirements only when they affect successful use, for example:

- a minimum Node.js version;
- browser APIs or lack of legacy-browser support;
- TypeScript compiler options;
- CommonJS or ES module constraints;
- another initialization command that must run first.

Show the normal installation command as an executable shell block:

```bash
npm i @itrocks/<package>
```

Use `--save-dev` for development-only tools. If the package exposes a command,
show how to run it with `npx` or from an npm script. Keep setup instructions in
execution order and make timing requirements explicit, especially for imports,
initializers, decorators, or module-loading hooks.

## Usage and examples

Lead with the smallest example that demonstrates the package's primary value.
It should be possible to copy it into a realistic project with minimal changes.

- Import from the actual public package or exported subpath.
- Include all imports needed to understand the example.
- Use realistic domain names and values instead of `foo` and `bar` when the
  domain helps explain the feature.
- Show the observable result with a return value, output comment, resulting
  object, generated route, or DOM effect.
- Use `await` when the documented API is asynchronous.
- Add a filename above a block when several files participate in the example.
- Prefer one complete basic example followed by focused variants over one large
  example that demonstrates everything.

Examples should teach constraints as well as the happy path. If initialization
must precede imports, references must be assigned explicitly, or an override
must inherit a base type, show that in the example and explain why.

Use fenced code blocks with the correct language (`bash`, `ts`, `js`, `json`,
`yaml`, or `html`). Follow the code style of the package itself.

## Explaining concepts and behaviour

Add an `Overview`, `Core idea`, `Behaviour`, or feature-specific section when
the public types alone do not explain the model.

Describe:

- the terms users must distinguish;
- ownership, lifecycle, ordering, or resolution rules;
- defaults and fallback behaviour;
- side effects and mutation;
- supported and deliberately unsupported cases;
- integration points with other `@itrocks` packages.

State behaviour precisely. Prefer “Only declared properties are assigned” or
“Triggers the native `change` event after drop” to broad benefit statements.
For multiple exact mappings, priorities, or configuration outcomes, use a small
table. For a simple sequence, use an ordered list.

## Documenting the API

Document public exports, not private implementation details. Group entries by
kind when useful: constants, types, functions, decorators, classes, properties,
and methods.

For each non-trivial API entry:

1. Use the exported name as the heading.
2. Show its TypeScript signature in a `ts` block.
3. State what it does in one direct sentence.
4. Describe parameters, including optional values and defaults.
5. Describe the return value and notable side effects.
6. Add a focused example when the signature is not self-explanatory.

Example:

````markdown
### createThing

```ts
createThing(config: Config, name: string = 'main'): Thing
```

Creates and registers a new thing.

**Parameters:**

- `config`: Configuration used to create the thing.
- `name`: Registry name. Defaults to `'main'`.

**Returns:**

The registered `Thing` instance.
````

For decorators, explain what they mark or store, where they may be applied, and
how an explicit `false` or omitted argument changes inherited/default behaviour.
For callbacks, document the callback signature and when it runs. For commands,
replace the API signature with the exact command and cover inputs, changes made,
output, exit behaviour, and dry-run mode where applicable.

Cross-link related entries within the README so definitions are not repeated.

## Package-specific variants

### Dependency bundles

List the packages pulled in and give each a one-line role. Explicitly say
whether the bundle exports runtime code. Explain when to depend on the bundle
instead of its individual packages, then show imports from those dedicated
packages rather than inventing a bundle API.

### Command-line tools

Document requirements, the exact invocation, configuration, and effects on the
filesystem or registry. Separate “what it does” from notes and caveats. Include
sample output when it helps users verify success, and a troubleshooting table
for recurring symptom/cause pairs.

### Browser packages

Show both the JavaScript import and any required stylesheet. Document automatic
integration for dynamically inserted DOM when available, DOM events or classes
the package adds, styling hooks, and browser/API requirements.

### Framework and configuration packages

Explain initialization order before the full API. Give a minimal configuration,
then document resolution, precedence, inheritance, or fallback rules. Add a
`Common mistakes` or `Limitations` section when misuse can appear to succeed
while having no effect.

## Links and typography

- Wrap package names, symbols, commands, filenames, HTML elements, attributes,
  and literal values in backticks.
- Link the first useful mention of another `@itrocks` package to its GitHub
  repository, or directly to the relevant heading when referring to one of its
  concepts.
- Link platform concepts to authoritative documentation such as MDN.
- Use relative heading links for concepts defined in the same README.
- Use bold text sparingly for labels or an important distinction, not for whole
  sentences.
- Keep paragraphs focused and line lengths readable. Break long explanations at
  logical phrase boundaries.
- Use notes only for exceptional information; put normal behaviour in the main
  prose.

## Accuracy and maintenance

Before publishing or updating a README:

- verify that the README's first sentence is exactly
  `package.json.description` plus a full stop;
- verify that `package.json.keywords` are relevant, unique, and sorted;
- parse `package.json` after editing it;
- verify every import against `exports` and the generated package files;
- compare signatures, defaults, return types, and async behaviour with source;
- run or type-check examples when practical;
- verify that linked packages, source files, demos, and headings exist;
- remove obsolete exports and instructions in the same change that removes the
  corresponding code;
- label incomplete features clearly instead of documenting them as available.

Do not copy an API section from a related package without checking semantic
differences. Avoid release-specific wording such as “new”, version-pinned
installation commands, and promises about future work in the main usage path.

## Minimal template

Use this as a starting point, then remove or rename optional sections to fit the
package:

````markdown
[the five standard badges]

# <package>

<package.json.description>.

## Requirements

- <Only actual prerequisites.>

## Installation

```bash
npm i @itrocks/<package>
```

## Usage

```ts
import { publicExport } from '@itrocks/<package>'

// Smallest useful example, including its observable result.
```

## Behaviour

- <Important default, rule, or side effect.>
- <Important unsupported case or limit.>

## API

### publicExport

```ts
publicExport(argument: Type, option?: Option): Result
```

<Purpose, parameters, return value, side effects, and focused example as needed.>

## Common mistakes

### <Concrete mistake>

<Why it fails and the correct usage.>
````

The final README should feel proportionate to the package: immediate value at
the top, enough detail to use the public contract safely, and no filler.

The accompanying `package.json` must contain the same canonical description
without the final full stop and a reviewed, sorted array of relevant keywords.
