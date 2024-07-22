# regex-utilities

Tiny utilities shared by the [`regex`](https://github.com/slevithan/regex) library and its extensions. Useful for parsing and processing regular expressions, when you don't need a full regex AST builder.

## Constants

### `Context`

Regex syntax context object with the following properties:

- `DEFAULT` - Base context.
- `CHAR_CLASS` - Character class context.

## Functions

See documentation in the source code for more details.

### `execUnescaped`

Return a match object for the first unescaped version of a pattern in the given context, or `null`.

### `hasUnescaped`

Check whether an unescaped version of a pattern appears in the given context.

### `forEachUnescaped`

Run a callback on each unescaped version of a pattern in the given context.

### `replaceUnescaped`

Replaces patterns only when they're unescaped and in the given context.

### `getGroupContents`

Given a pattern and start position (just after the group's opening delimiter), return the contents of the group, accounting for escaped characters, nested groups, and character classes. Returns the rest of the string if the group is unclosed.
