export const COOKIE_AUTH_USER = 'auth_user';
export const COOKIE_FIXING_ERRORS = 'fixing_errors';
export const COOKIE_APP_ERRORS = 'app_errors';
export const COOKIE_DOMAIN =
  import.meta.env.VITE_COOKIE_DOMAIN || process.env.VITE_COOKIE_DOMAIN || '';
export const COOKIE_PATH = import.meta.env.VITE_COOKIE_PATH || process.env.VITE_COOKIE_PATH || '/';
