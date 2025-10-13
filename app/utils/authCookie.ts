import { setCookie } from './cookie.js';
import { COOKIE_DOMAIN, COOKIE_PATH } from '../env.ts';

export function saveAuthToken(token: string, domain?: string, path?: string) {
  setCookie('token', token, 7, domain ?? COOKIE_DOMAIN, path ?? COOKIE_PATH);
}
