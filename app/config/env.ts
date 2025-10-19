const API_URL = import.meta.env.VITE_API_URL || '';
const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN || '';
const COOKIE_PATH = import.meta.env.VITE_COOKIE_PATH || '/';

export const env = {
  API_URL,
  COOKIE_DOMAIN,
  COOKIE_PATH,
};
