# SCSS and visual assets

## Decision rule

Style the semantic HTML contract owned by a feature. Put application-wide layout and element defaults in `ux-core`;
put feature structure, state, and icons in the feature package that emits or activates the matching markup.

## Selector contracts

- Base selectors on stable semantic elements, feature classes, action names, and `data-*` attributes already used by
  HTML and TypeScript.
- Nest selectors to mirror ownership in the DOM and use direct-child combinators when the structure is part of the
  contract. Avoid broad descendant rules that leak into included components.
- Represent interactive state with a class or data attribute, such as `.drag-over`, `.visible`, `.read`, or
  `[data-sort]`; let TypeScript change state and SCSS render it.
- Keep selectors compatible with full-page rendering and fragment insertion. Do not depend on transient wrapper
  elements created only during one navigation path.

Reusable layout partials are composed with Sass `@use`. Feature stylesheets are linked by the templates that need
them, so asynchronously loaded fragments can bring their own styles through head processing.

## Actions and assets

Action styles follow the shared contract when an action needs an icon:

```scss
.action.save,
ul.actions > li.save {
	background-image: url('save.svg');
}
```

Keep the action name aligned across the route/action repository, template class, stylesheet selector, and asset file.
Asset URLs are relative to the compiled CSS location; the package build must copy SVG, font, or image files to the
matching published location.

Use the existing responsive breakpoint and container contract when extending a shared layout. Put component-specific
responsive behavior beside the component, not in an unrelated global file.

## Implementation checklist

- Identify the HTML or TypeScript owner of every selector.
- Scope feature styles narrowly and preserve reusable nested content.
- Add a semantic state contract before styling a runtime condition.
- Verify the compiled CSS path for every `url(...)` and `@use`.
- Link the stylesheet from each standalone template that requires it.
- Test the same markup as a full page and as an asynchronously inserted fragment.

Reference implementations: `ux-core/css/app.scss`, `ux-core/css/body.scss`, `action-bar/action.scss`,
`list/src/list.scss`, `output/src/output.scss`, `notifications/css/notifications.scss`, and `save/src/action.scss`.
