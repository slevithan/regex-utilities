export const RegexContext = {
  DEFAULT: 'DEFAULT',
  CHAR_CLASS: 'CHAR_CLASS',
};

/**
Replaces patterns only when they're unescaped and in the given context.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax.
Assumes flag v and doesn't worry about syntax errors that are caught by it.
@param {string} pattern
@param {string} needle Search as a regex pattern, with flags `su`
@param {string | (match: RegExpExecArray) => string} replacement
@param {'DEFAULT' | 'CHAR_CLASS'} [inRegexContext]
@returns {string} Pattern with replacements
@example
replaceUnescaped(String.raw`.\.\\.\\\.[[\.].].`, '\\.', '~');
// -> String.raw`~\.\\~\\\.[[\.]~]~`
replaceUnescaped(String.raw`.\.\\.\\\.[[\.].].`, '\\.', '~', RegexContext.DEFAULT);
// -> String.raw`~\.\\~\\\.[[\.].]~`
*/
export function replaceUnescaped(pattern, needle, replacement, inRegexContext) {
  const re = new RegExp(String.raw`(?<found>${needle})|\\?.`, 'gsu');
  let numCharClassesOpen = 0;
  let result = '';
  for (const match of pattern.matchAll(re)) {
    const {0: m, groups: {found}} = match;
    if (found && (!inRegexContext || (inRegexContext === RegexContext.DEFAULT) === !numCharClassesOpen)) {
      if (replacement instanceof Function) {
        result += replacement(match);
      } else {
        result += replacement;
      }
      continue;
    }
    if (m === '[') {
      numCharClassesOpen++;
    } else if (m === ']' && numCharClassesOpen) {
      numCharClassesOpen--;
    }
    result += m;
  }
  return result;
}

/**
Run a callback on the first unescaped version of a pattern in the given context.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax.
Assumes flag v and doesn't worry about syntax errors that are caught by it.
@param {string} pattern
@param {string} needle Search as a regex pattern, with flags `su`
@param {(match: RegExpExecArray) => void} [callback]
@param {'DEFAULT' | 'CHAR_CLASS'} [inRegexContext]
@returns {boolean} Whether the pattern was found
*/
export function findUnescaped(pattern, needle, callback, inRegexContext) {
  // Quick partial test; avoid the loop if not needed
  if (!(new RegExp(needle, 'su')).test(pattern)) {
    return false;
  }
  const re = new RegExp(String.raw`(?<found>${needle})|\\?.`, 'gsu');
  let numCharClassesOpen = 0;
  for (const match of pattern.matchAll(re)) {
    const {0: m, groups: {found}} = match;
    if (found && (!inRegexContext || (inRegexContext === RegexContext.DEFAULT) === !numCharClassesOpen)) {
      if (callback) {
        callback(match);
      }
      return true;
    }
    if (m === '[') {
      numCharClassesOpen++;
    } else if (m === ']' && numCharClassesOpen) {
      numCharClassesOpen--;
    }
  }
  return false;
}

/**
Check whether an unescaped version of a pattern appears in the given context.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax.
Assumes flag v and doesn't worry about syntax errors that are caught by it.
@param {string} pattern
@param {string} needle Search as a regex pattern, with flags `su`
@param {'DEFAULT' | 'CHAR_CLASS'} [inRegexContext]
@returns {boolean} Whether the pattern was found
*/
export function hasUnescaped(pattern, needle, inRegexContext) {
  return findUnescaped(pattern, needle, null, inRegexContext);
}
