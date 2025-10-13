export function getCookieDomainFromQuery(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  return params.get('domain') || undefined;
}

export function getCookiePathFromQuery(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('path') || '/';
}
