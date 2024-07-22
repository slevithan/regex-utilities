# regex-utilities

[![build status](https://github.com/slevithan/regex-utilities/workflows/CI/badge.svg)](https://github.com/slevithan/regex-utilities/actions)
[![npm](https://img.shields.io/npm/v/regex-utilities)](https://www.npmjs.com/package/regex-utilities)
[![bundle size](https://deno.bundlejs.com/badge?q=regex-utilities&treeshake=[*])](https://bundlejs.com/?q=regex-utilities&treeshake=[*])

Tiny utilities shared by the [`regex`](https://github.com/slevithan/regex) library and its extensions. Useful for parsing and processing regular expressions, when you don't need a full regex AST builder.

## Constants

### `Context`

Frozen object with the following properties for tracking regex syntax context:

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

Replaces the given pattern only when it's unescaped and in the given context.

### `getGroupContents`

Given a regex pattern and start position (just after the group's opening delimiter), return the contents of the group, accounting for escaped characters, nested groups, and character classes. Returns the rest of the string if the group is unclosed.
