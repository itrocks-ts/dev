# Coding conventions

Apply applicable rules to all source, test, and development files in it.rocks packages.

## Layout

- Limit lines to 120 columns when practical; count each indentation tab as
  two columns regardless of its display width. Only indivisible content may exceed it.
- Indent with tabs in every format that permits them, including HTML and SCSS.
  Use spaces only for alignment or when the format forbids tabs, as YAML does.
- Omit semicolons.
- Use single quotes; use template literals for interpolation or multiline text.
- Write postfix operators with a space: `index ++`, `index --`.
- In adjacent related lines, align `from`, `=`, `:`, and values when this stays within 120 columns.

## Blocks

- Put `{` on the next line for classes, interfaces, functions, methods, and constructors.
- Keep `{` on the control line for `if`, `else`, loops, `switch`, `try`, `catch`, and `finally`.
- Put `else`, `catch`, and `finally` on a new line after the preceding `}`.
- A single-line control body may omit braces; a multiline body must use them.
- Leave one blank line after a non-empty class opening brace and before its closing brace.

## Function signatures

Use the first layout below that stays within 120 columns. The same parameter
and return-type breaks apply to methods, constructors, overloads, and arrow functions.

```ts
function calculate(input: Input, options: Options): Result
{
}

function calculate(input: Input, options: Options)
	: Promise<Result>
{
}

function calculate(
	input: Input, options: Options
): Promise<Result>
{
}

function calculate(
	input: Input,
	options: Options
): Promise<Result>
{
}
```

After breaking after `(` and before `)`, parameters may share one line while that
line stays within 120 columns; otherwise put one parameter per line. Omit
the trailing comma and keep `): ReturnType` together. If an otherwise single-line
signature overflows only because of its return type, move `: ReturnType` to the
next line before splitting the parameters.

## Arbitrary ordering

Whenever order has no compiler, framework, protocol, runtime, or semantic significance, sort every homogeneous
sequence alphabetically by its declared identifier, key, method name, property name, or other stable name.

This rule applies throughout configuration, documentation, source, and test files, including:

- array and object entries;
- class and object methods and properties;
- class, function, interface, type, and variable declarations;
- configuration keys and declarative lists;
- constants, exports, imports, parameters, and test cases.

Keep semantically coherent kinds in separate groups when that improves readability, then sort each arbitrary group
alphabetically. Preserve any order required for fallbacks, handlers, initialization, lifecycle, overload resolution,
precedence, protocols, the runtime, or side effects. Comment a non-obvious ordering constraint.

### Import ordering

Import paths express locality, so sort side-effect-free imports from the most general source to the source closest to
the current module. Apply this location order before alphabetical order:

1. bare module specifiers, including packages and Node.js built-ins;
2. parent-relative paths, from the farthest parent to the closest (`../../../`, then `../../`, then `../`);
3. paths into subdirectories, from the deepest subdirectory to the closest;
4. same-directory paths starting with `./` and containing no subdirectory.

Within the same location and tree depth, sort alphabetically by module specifier. For repeated imports from the same
module specifier, sort alphabetically by imported symbol.

```ts
import { Component } from '@itrocks/core'
import { readFile }   from 'node:fs'
import { ancestor }   from '../../../ancestor'
import { foundation } from '../../foundation'
import { parent }     from '../parent'
import { validator }  from './features/contacts/validator'
import { contacts }   from './features/contacts'
import { feature }    from './features'
import { local }      from './local'
```

## Modules and declarations

- Start each TypeScript module with a blank line, except when import declarations come first;
  in that case, do not put a blank line before them.
- Import one symbol per import declaration.
- Keep imports first; sort side-effect-free imports using the import ordering above, and align `from`.
- Omit `.js` and `.ts` extensions from module specifiers when module resolution permits it.
- Prefer named exports; use a default export only when an external API requires it.
- Use `const` unless reassignment is required; never use `var`.
- Use object property and method shorthand.
- Use a concise arrow body for a single returned expression.

Group declarations by kind in this order when that grouping has no semantic significance:

1. types and interfaces;
2. constants;
3. `let` declarations;
4. functions;
5. classes.

Apply the general arbitrary-ordering rule above within each group.
