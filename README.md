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

Returns a match object for the first unescaped instance of a pattern that is in the given context. Else, returns `null`.

### `hasUnescaped`

Checks whether an unescaped instance of a pattern appears in the given context.

### `forEachUnescaped`

Runs a callback for each unescaped instance of a pattern that is in the given context.

### `replaceUnescaped`

Replaces all unescaped instances of a pattern that are in the given context.

### `getGroupContents`

Returns the contents of the group within the given pattern, with the group being identified by the position where its contents start (i.e., just *after* the group's opening delimiter). Accounts for escaped characters, nested groups, and character classes. Returns the rest of the string if the group is unclosed.
