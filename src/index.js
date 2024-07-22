export const Context = {
  DEFAULT: 'DEFAULT',
  CHAR_CLASS: 'CHAR_CLASS',
};

/**
Replaces the given pattern only when it's unescaped and in the given context.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax. Assumes UnicodeSets-mode syntax.
@param {string} expression Search target
@param {string} needle Search as a regex pattern, with flags `su` applied
@param {string | (match: RegExpExecArray) => string} replacement
@param {'DEFAULT' | 'CHAR_CLASS'} [context] All contexts if not specified
@returns {string} Updated expression
@example
replaceUnescaped(String.raw`.\.\\.[[\.].].`, '\\.', '~');
// → String.raw`~\.\\~[[\.]~]~`
replaceUnescaped(String.raw`.\.\\.[[\.].].`, '\\.', '~', Context.DEFAULT);
// → String.raw`~\.\\~[[\.].]~`
replaceUnescaped(String.raw`.\.\\.[[\.].].`, '\\.', '~', Context.CHAR_CLASS);
// → String.raw`.\.\\.[[\.]~].`
*/
export function replaceUnescaped(expression, needle, replacement, context) {
  const re = new RegExp(`${needle}|(?<skip>\\\\?.)`, 'gsu');
  let numCharClassesOpen = 0;
  let result = '';
  for (const match of expression.matchAll(re)) {
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
knowledge of what's safe to do given regex syntax. Assumes UnicodeSets-mode syntax.
@param {string} expression Search target
@param {string} needle Search as a regex pattern, with flags `su` applied
@param {(match: RegExpExecArray) => void} callback
@param {'DEFAULT' | 'CHAR_CLASS'} [context] All contexts if not specified
*/
export function forEachUnescaped(expression, needle, callback, context) {
  // Do this the easy way
  replaceUnescaped(expression, needle, callback, context);
}

/**
Return a match object for the first unescaped version of a pattern in the given context, or `null`.
Doesn't skip over complete multicharacter tokens (only `\` and folowing char) so must be used with
knowledge of what's safe to do given regex syntax. Assumes UnicodeSets-mode syntax.
@param {string} expression Search target
@param {string} needle Search as a regex pattern, with flags `su` applied
@param {number} [pos] Offset to start the search
@param {'DEFAULT' | 'CHAR_CLASS'} [context] All contexts if not specified
@returns {RegExpExecArray | null}
*/
export function execUnescaped(expression, needle, pos = 0, context) {
  // Quick partial test; avoid the loop if not needed
  if (!(new RegExp(needle, 'su').test(expression))) {
    return null;
  }
  const re = new RegExp(`${needle}|(?<skip>\\\\?.)`, 'gsu');
  re.lastIndex = pos;
  let numCharClassesOpen = 0;
  let match;
  while (match = re.exec(expression)) {
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
knowledge of what's safe to do given regex syntax. Assumes UnicodeSets-mode syntax.
@param {string} expression Search target
@param {string} needle Search as a regex pattern, with flags `su` applied
@param {'DEFAULT' | 'CHAR_CLASS'} [context] All contexts if not specified
@returns {boolean} Whether the pattern was found
*/
export function hasUnescaped(expression, needle, context) {
  // Do this the easy way
  return !!execUnescaped(expression, needle, 0, context);
}

/**
Given a regex pattern and start position (just after the group's opening delimiter), return the
contents of the group, accounting for escaped characters, nested groups, and character classes.
Returns the rest of the string if the group is unclosed. Assumes UnicodeSets-mode syntax.
@param {string} expression Search target
@param {number} contentsStartPos
@returns {string}
*/
export function getGroupContents(expression, contentsStartPos) {
  const token = /\\?./gsu;
  token.lastIndex = contentsStartPos;
  let contentsEndPos = expression.length;
  let numCharClassesOpen = 0;
  // Starting search within an open group, after the group's opening
  let numGroupsOpen = 1;
  let match;
  while (match = token.exec(expression)) {
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
  return expression.slice(contentsStartPos, contentsEndPos);
}
