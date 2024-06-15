import {Context, execUnescaped, forEachUnescaped, hasUnescaped, replaceUnescaped} from '../src/index.js';

describe('replaceUnescaped', () => {
  it('should replace all with string replacement in all contexts', () => {
    expect(replaceUnescaped(String.raw`.\.\\.\\\.[[\.].].`, '\\.', '~')).toBe(String.raw`~\.\\~\\\.[[\.]~]~`);
  });

  it('should replace all with string replacement in DEFAULT context', () => {
    expect(replaceUnescaped(String.raw`.\.\\.\\\.[[\.].].`, '\\.', '~', Context.DEFAULT)).toBe(String.raw`~\.\\~\\\.[[\.].]~`);
  });

  it('should replace all with string replacement in CHAR_CLASS context', () => {
    expect(replaceUnescaped(String.raw`.\.\\.\\\.[[\.].].`, '\\.', '~', Context.CHAR_CLASS)).toBe(String.raw`.\.\\.\\\.[[\.]~].`);
  });

  it('should replace all using a replacement function and numbered backrefs', () => {
    expect(replaceUnescaped('%1 %22', '%(\\d+)', ([_, $1]) => `\\${$1}`)).toBe('\\1 \\22');
  });

  it('should replace all using a replacement function and named backrefs', () => {
    expect(replaceUnescaped('%1 %22', '%(?<num>\\d+)', ({groups: {num}}) => `\\${num}`)).toBe('\\1 \\22');
  });
});

describe('forEachUnescaped', () => {
  it('should run callback for matches in all contexts', () => {
    let count = 0;
    forEachUnescaped(String.raw`.\.\\.[[\.].]`, '\\.', () => count++);
    expect(count).toBe(3);
  });

  it('should run callback for matches in DEFAULT context', () => {
    let count = 0;
    forEachUnescaped(String.raw`.\.\\.[[\.].]`, '\\.', () => count++, Context.DEFAULT);
    expect(count).toBe(2);
  });

  it('should run callback for matches in CHAR_CLASS context', () => {
    let count = 0;
    forEachUnescaped(String.raw`.\.\\.[[\.].]`, '\\.', () => count++, Context.CHAR_CLASS);
    expect(count).toBe(1);
  });
});

describe('execUnescaped', () => {
  it('should find match in all contexts', () => {
    expect(execUnescaped(String.raw`\..`, '\\.')[0]).toBe('.');
    expect(execUnescaped(String.raw`\..`, '\\.').index).toBe(2);
    expect(execUnescaped(String.raw`\.[.]`, '\\.').index).toBe(3);
  });

  it('should find match in DEFAULT context', () => {
    expect(execUnescaped(String.raw`\..`, '\\.', 0, Context.DEFAULT).index).toBe(2);
    expect(execUnescaped(String.raw`\.[.]`, '\\.', 0, Context.DEFAULT)).toBeNull();
  });

  it('should find match in CHAR_CLASS context', () => {
    expect(execUnescaped(String.raw`\..`, '\\.', 0, Context.CHAR_CLASS)).toBeNull();
    expect(execUnescaped(String.raw`\.[.]`, '\\.', 0, Context.CHAR_CLASS).index).toBe(3);
  });

  it('should use pos as start position', () => {
    expect(execUnescaped(String.raw`..`, '\\.', 0).index).toBe(0);
    expect(execUnescaped(String.raw`..`, '\\.', 1).index).toBe(1);
  });

  it('should allow zero-length match', () => {
    expect(execUnescaped(String.raw`..`, '(?:)').index).toBe(0);
  });
});

describe('hasUnescaped', () => {
  it('should find match in all contexts', () => {
    expect(hasUnescaped(String.raw`\..`, '\\.')).toBeTrue();
    expect(hasUnescaped(String.raw`\.[.]`, '\\.')).toBeTrue();
    expect(hasUnescaped(String.raw`\.`, '\\.')).toBeFalse();
    expect(hasUnescaped(String.raw`[\.]`, '\\.')).toBeFalse();
  });

  it('should find match in DEFAULT context', () => {
    expect(hasUnescaped(String.raw`\..`, '\\.', Context.DEFAULT)).toBeTrue();
    expect(hasUnescaped(String.raw`\.[.]`, '\\.', Context.DEFAULT)).toBeFalse();
  });

  it('should find match in CHAR_CLASS context', () => {
    expect(hasUnescaped(String.raw`\..`, '\\.', Context.CHAR_CLASS)).toBeFalse();
    expect(hasUnescaped(String.raw`\.[.]`, '\\.', Context.CHAR_CLASS)).toBeTrue();
  });
});
