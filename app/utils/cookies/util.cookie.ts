/**
 * Cookie utility class for managing browser cookies
 */
export class CookieUtils {
  /**
   * Set a cookie with name, value and optional parameters
   */
  static setCookie(name: string, value: string, days = 7, domain?: string, path = '/') {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    let cookieStr = `${name}=${encodeURIComponent(value)}${expires}; path=${path}`;
    if (domain) cookieStr += `; domain=${domain}`;
    document.cookie = cookieStr;
  }

  /**
   * Get a cookie value by name
   */
  static getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  /**
   * Remove a cookie by name
   */
  static removeCookie(name: string, domain?: string, path = '/') {
    this.setCookie(name, '', -1, domain, path);
  }
}

// Export legacy function names for backward compatibility
export const setCookie = CookieUtils.setCookie.bind(CookieUtils);
export const getCookie = CookieUtils.getCookie.bind(CookieUtils);
export const removeCookie = CookieUtils.removeCookie.bind(CookieUtils);
