# Documentation guidelines

Apply these conventions whenever creating or updating Markdown documentation in an it.rocks project, including
`README.md`, `docs/dependencies.md`, architecture documents, guides, and any other `.md` file. More specialized
documentation guidelines add content requirements but do not replace these formatting rules.

## Line length

- Limit Markdown source lines to 120 columns.
- Wrap prose at a natural phrase boundary before reaching the limit.
- Include Markdown syntax when counting columns.
- Allow a line to exceed 120 columns only when it contains indivisible content, such as a URL that cannot be shortened
  or split without changing its target.
- Keep fenced code examples within 120 columns when the language and the demonstrated syntax permit it.

## Tables

Format Markdown tables so that they remain readable in the source file as well as when rendered:

- pad every cell with spaces so that the pipe separators align vertically;
- size each separator cell to the width of its column while preserving any alignment marker (`:`);
- keep the complete table within 120 columns;
- shorten headings or cell text, split the table, or use another structure when an aligned table would exceed the
  limit;
- realign the whole table after changing any cell.

For example:

```markdown
| Dependency  | Supplied value                         |
|-------------|----------------------------------------|
| `displayOf` | `@itrocks/property-view:displayOf`     |
| `routeOf`   | `@itrocks/route:routeOf`               |
```
