# regex-utilities

[![build status](https://github.com/slevithan/regex-utilities/workflows/CI/badge.svg)](https://github.com/slevithan/regex-utilities/actions)
[![npm](https://img.shields.io/npm/v/regex-utilities)](https://www.npmjs.com/package/regex-utilities)
[![bundle size](https://deno.bundlejs.com/badge?q=regex-utilities&treeshake=[*])](https://bundlejs.com/?q=regex-utilities&treeshake=[*])

Tiny utilities shared by the [regex](https://github.com/slevithan/regex) library and its plugins. Useful for parsing and processing regular expression syntax in a lightweight way, when you don't need a full regex AST.

## Constants

### `Context`

Frozen object with the following properties for tracking regex syntax context:

- `DEFAULT` - Base context.
- `CHAR_CLASS` - Character class context.

## Functions

For all of the following functions, argument `expression` is the target string, and `needle` is the pattern to search for.

- Argument `expression` is assumed to be a flag-`v`-mode regex pattern string (in other words, nested character classes are allowed when determining the context for a match).
- Argument `needle` is a regex pattern as a string, and is applied with flags `su`.
- If argument `context` is not provided, matches are allowed in all contexts (in other words, inside and outside of character classes).

### `execUnescaped`

Arguments: `expression, needle, [pos = 0], [context]`

Returns a match object for the first unescaped instance of a regex pattern in the given context, or `null`.

### `hasUnescaped`

Arguments: `expression, needle, [context]`

Checks whether an unescaped instance of a regex pattern appears in the given context.

### `forEachUnescaped`

Arguments: `expression, needle, callback, [context]`

Runs a callback for each unescaped instance of a regex pattern in the given context.

### `replaceUnescaped`

Arguments: `expression, needle, replacement, [context]`

Replaces all unescaped instances of a regex pattern in the given context, using a replacement string or callback.

<details>
  <summary>Examples</summary>

```js
replaceUnescaped('.\\.\\\\.[[\\.].].', '\\.', '~');
// → '~\\.\\\\~[[\\.]~]~'

replaceUnescaped('.\\.\\\\.[[\\.].].', '\\.', '~', Context.DEFAULT);
// → '~\\.\\\\~[[\\.].]~'

replaceUnescaped('.\\.\\\\.[[\\.].].', '\\.', '~', Context.CHAR_CLASS);
// → '.\\.\\\\.[[\\.]~].'
```
</details>

### `getGroupContents`

Arguments: `expression, contentsStartPos`

Extracts the full contents of a group (subpattern) from the given expression, accounting for escaped characters, nested groups, and character classes. The group is identified by the position where its contents start (the string index just after the group's opening delimiter). Returns the rest of the string if the group is unclosed.
