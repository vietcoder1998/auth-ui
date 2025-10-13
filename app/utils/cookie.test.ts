import { setCookie, getCookie } from './cookie.ts';

describe('cookie utils', () => {
  it('sets and gets a cookie', () => {
    setCookie('test', 'value', 1);
    expect(getCookie('test')).toBe('value');
  });
});
