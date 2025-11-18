/**
 * Cookie domain and path utilities from URL query parameters
 */
export class CookieDomainUtils {
  /**
   * Get cookie domain from URL query parameters
   */
  static getCookieDomainFromQuery(): string | undefined {
    const params = new URLSearchParams(window.location.search);
    return params.get('domain') || undefined;
  }

  /**
   * Get cookie path from URL query parameters
   */
  static getCookiePathFromQuery(): string {
    const params = new URLSearchParams(window.location.search);
    return params.get('path') || '/';
  }
}
