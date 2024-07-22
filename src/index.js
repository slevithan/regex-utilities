export const Context = {
  DEFAULT: 'DEFAULT',
  CHAR_CLASS: 'CHAR_CLASS',
};

/**
Replaces patterns only when they're unescaped and in the given context.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax. Assumes flag v and doesn't worry about syntax
errors that are caught by it.
@param {string} pattern
@param {string} needle Search as a regex pattern, with flags `su`
@param {string | (match: RegExpExecArray) => string} replacement
@param {'DEFAULT' | 'CHAR_CLASS'} [context] All contexts if not specified
@returns {string} Pattern with replacements
@example
replaceUnescaped(String.raw`.\.\\.[[\.].].`, '\\.', '~');
// → String.raw`~\.\\~[[\.]~]~`
replaceUnescaped(String.raw`.\.\\.[[\.].].`, '\\.', '~', Context.DEFAULT);
// → String.raw`~\.\\~[[\.].]~`
replaceUnescaped(String.raw`.\.\\.[[\.].].`, '\\.', '~', Context.CHAR_CLASS);
// → String.raw`.\.\\.[[\.]~].`
*/
export function replaceUnescaped(pattern, needle, replacement, context) {
  const re = new RegExp(String.raw`${needle}|(?<skip>\\?.)`, 'gsu');
  let numCharClassesOpen = 0;
  let result = '';
  for (const match of pattern.matchAll(re)) {
    const {0: m, groups: {skip}} = match;
    if (!skip && (!context || (context === Context.DEFAULT) === !numCharClassesOpen)) {
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
Run a callback on each unescaped version of a pattern in the given context.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax. Assumes flag v and doesn't worry about syntax
errors that are caught by it.
@param {string} pattern
@param {string} needle Search as a regex pattern, with flags `su`
@param {(match: RegExpExecArray) => void} callback
@param {'DEFAULT' | 'CHAR_CLASS'} [context] All contexts if not specified
*/
export function forEachUnescaped(pattern, needle, callback, context) {
  // Do this the easy way
  replaceUnescaped(pattern, needle, callback, context);
}

/**
Return a match array for the first unescaped version of a pattern in the given context, or null.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax. Assumes flag v and doesn't worry about syntax
errors that are caught by it.
@param {string} pattern
@param {string} needle Search as a regex pattern, with flags `su`
@param {number} [pos] Offset to start the search
@param {'DEFAULT' | 'CHAR_CLASS'} [context] All contexts if not specified
@returns {RegExpExecArray | null}
*/
export function execUnescaped(pattern, needle, pos = 0, context) {
  // Quick partial test; avoid the loop if not needed
  if (!(new RegExp(needle, 'su').test(pattern))) {
    return null;
  }
  const re = new RegExp(String.raw`${needle}|(?<skip>\\?.)`, 'gsu');
  re.lastIndex = pos;
  let numCharClassesOpen = 0;
  let match;
  while (match = re.exec(pattern)) {
    const {0: m, groups: {skip}} = match;
    if (!skip && (!context || (context === Context.DEFAULT) === !numCharClassesOpen)) {
      return match;
    }
    if (m === '[') {
      numCharClassesOpen++;
    } else if (m === ']' && numCharClassesOpen) {
      numCharClassesOpen--;
    }
    // Avoid an infinite loop on zero-length matches
    if (re.lastIndex == match.index) {
      re.lastIndex++;
    }
  }
  return null;
}

/**
Check whether an unescaped version of a pattern appears in the given context.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax. Assumes flag v and doesn't worry about syntax
errors that are caught by it.
@param {string} pattern
@param {string} needle Search as a regex pattern, with flags `su`
@param {'DEFAULT' | 'CHAR_CLASS'} [context] All contexts if not specified
@returns {boolean} Whether the pattern was found
*/
export function hasUnescaped(pattern, needle, context) {
  // Do this the easy way
  return !!execUnescaped(pattern, needle, 0, context);
}

/**
Given a pattern and start position (just after the group's opening delimiter), return the contents
of the group, accounting for escaped characters, nested groups, and character classes. Returns the
rest of the string if the group is unclosed.
@param {string} pattern
@param {number} contentsStartPos
@returns {string}
*/
export function getGroupContents(pattern, contentsStartPos) {
  const token = /\\?./gsu;
  token.lastIndex = contentsStartPos;
  let contentsEndPos = pattern.length;
  let numCharClassesOpen = 0;
  // Starting search within an open group, after the group's opening
  let numGroupsOpen = 1;
  let match;
  while (match = token.exec(pattern)) {
    const [m] = match;
    if (m === '[') {
      numCharClassesOpen++;
    } else if (!numCharClassesOpen) {
      if (m === '(') {
        numGroupsOpen++;
      } else if (m === ')') {
        numGroupsOpen--;
        if (!numGroupsOpen) {
          contentsEndPos = match.index;
          break;
        }
      }
    } else if (m === ']') {
      numCharClassesOpen--;
    }
  }
  return pattern.slice(contentsStartPos, contentsEndPos);
}
