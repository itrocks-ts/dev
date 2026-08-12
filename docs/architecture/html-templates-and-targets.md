# HTML templates and targets

## Decision rule

Make each server-rendered screen valid as a full HTML document and mark the part that can replace existing DOM. Keep
data traversal and inclusion in the template language; keep business decisions in the action that prepares its data.

## Data expressions

The template context is an object or class instance prepared by the action. Common forms are:

| Form | Meaning |
|------|---------|
| `{property.path}` | Read a path; a non-class function value is called on its owner. |
| `{?property}` or `{property?}` | Optional expression; suppress its attribute contribution or block when falsy. |
| `<!--items-->...<!--end-->` | Render a truthy value once, or iterate an iterable with each item as context. |
| `{./file.html}` | Include a template relative to the current template with the current context. |
| `{{template}}` | Resolve a template path from data, then include that template. |
| `{@display}`, `{@output}`, `{@route}` | Read view or route decorator semantics. |
| `{%property.name}`, `{%orderedProperties}` | Traverse `ReflectClass` or `ReflectProperty`. |

Use `data-if="{condition}" ... data-end` when several attributes are conditional. Literal user-facing text in the
template is translated by `template-insight`; use `.tr` only for data-derived strings that need explicit translation.

For application URLs in `action`, `formaction`, `href`, `location`, or `src`, use the established
`app://(expression)` form. The parser removes the marker and evaluates parenthesized path expressions.

## Full documents, fragments, and targets

- Put `<!--BEGIN-->` and `<!--END-->` around the response fragment used by asynchronous navigation.
- Use `<!--#selector-->...<!--#end-->` for a response that updates a specific target. A response may contain several
  such blocks.
- A target may add `:content`, `:replace`, `:before`, `:after`, `:prepend`, `:append`, or `:auto`. Content replacement
  is the default.
- Use semantic targets already owned by the application, commonly `main` and `#notifications:prepend`.
- Keep the full `<head>` accurate. Client navigation imports missing styles and scripts without duplicating existing
  URLs and updates the document title.

Includes keep their CSS and script dependencies. Relative links are normalized to application paths; dependencies
under `node_modules/@itrocks` become `/@itrocks/...`, while other dependencies become `/lib/...`.

## Implementation checklist

- Pass a small, named data shape from the action.
- Produce valid standalone HTML with language, title, required assets, and one clear fragment boundary.
- Match target comments and `<!--end-->` blocks exactly.
- Use reflection and decorators for generic model rendering.
- Keep selectors, `data-*` attributes, action names, and SCSS contracts synchronized.
- Test both direct navigation and insertion into the target DOM.

Reference implementations: `template/src/template.ts`, `template-insight/src/template.ts`, `edit/src/edit.html`,
`list/src/list.html`, `home/src/container.html`, `xtarget/src/begin-end.ts`, and `xtarget/src/composite.ts`.
