export function setCookie(name: string, value: string, days = 7, domain?: string, path = '/') {
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

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
