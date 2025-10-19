import { setCookie } from './cookie.js';
import { env } from '../config/env.ts';

export function saveAuthToken(token: string, domain?: string, path?: string) {
  setCookie('token', token, 7, domain ?? env.COOKIE_DOMAIN, path ?? env.COOKIE_PATH);
}
