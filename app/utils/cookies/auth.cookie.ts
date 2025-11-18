import { CookieUtils } from './util.cookie.ts';
import { env } from '../../config/env.ts';

/**
 * Authentication cookie management class
 */
export class AuthCookieUtils {
  /**
   * Save authentication token to cookie
   */
  static saveAuthToken(token: string, domain?: string, path?: string) {
    CookieUtils.setCookie('token', token, 7, domain ?? env.COOKIE_DOMAIN, path ?? env.COOKIE_PATH);
  }

  /**
   * Get authentication token from cookie
   */
  static getAuthToken(): string | null {
    return CookieUtils.getCookie('token');
  }

  /**
   * Remove authentication token from cookie
   */
  static removeAuthToken(domain?: string, path?: string) {
    CookieUtils.removeCookie('token', domain ?? env.COOKIE_DOMAIN, path ?? env.COOKIE_PATH);
  }

  /**
   * Save user data to cookie
   */
  static saveAuthUser(userData: any, domain?: string, path?: string) {
    const userJson = JSON.stringify(userData);
    CookieUtils.setCookie(
      'auth_user',
      userJson,
      7,
      domain ?? env.COOKIE_DOMAIN,
      path ?? env.COOKIE_PATH
    );
  }

  /**
   * Get user data from cookie
   */
  static getAuthUser(): any | null {
    const userJson = CookieUtils.getCookie('auth_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to parse user data from cookie:', error);
      return null;
    }
  }

  /**
   * Remove user data from cookie
   */
  static removeAuthUser(domain?: string, path?: string) {
    CookieUtils.removeCookie('auth_user', domain ?? env.COOKIE_DOMAIN, path ?? env.COOKIE_PATH);
  }

  /**
   * Clear all auth cookies
   */
  static clearAuth(domain?: string, path?: string) {
    this.removeAuthToken(domain, path);
    this.removeAuthUser(domain, path);
  }
}

// Export legacy function for backward compatibility
export const saveAuthToken = AuthCookieUtils.saveAuthToken.bind(AuthCookieUtils);
export const getAuthToken = AuthCookieUtils.getAuthToken.bind(AuthCookieUtils);
export const removeAuthToken = AuthCookieUtils.removeAuthToken.bind(AuthCookieUtils);
