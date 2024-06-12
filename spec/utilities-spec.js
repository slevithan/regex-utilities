import {Context, forEachUnescaped, replaceUnescaped} from '../src/index.js';

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
