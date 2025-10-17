import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface UseCookieOptions {
  expires?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export function useCookie<T>(
  name: string,
  defaultValue: T,
  options: UseCookieOptions = {}
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const cookieValue = Cookies.get(name);
      if (cookieValue) {
        return JSON.parse(cookieValue);
      }
    } catch (error) {
      console.error(`Failed to parse cookie "${name}":`, error);
    }
    return defaultValue;
  });

  const setCookieValue = (newValue: T) => {
    try {
      setValue(newValue);
      Cookies.set(name, JSON.stringify(newValue), {
        expires: options.expires || 365,
        path: options.path || '/',
        domain: options.domain,
        secure: options.secure,
        sameSite: options.sameSite || 'lax'
      });
    } catch (error) {
      console.error(`Failed to set cookie "${name}":`, error);
    }
  };

  const removeCookie = () => {
    setValue(defaultValue);
    Cookies.remove(name, {
      path: options.path || '/',
      domain: options.domain
    });
  };

  // Sync with cookie changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const cookieValue = Cookies.get(name);
        if (cookieValue) {
          const parsedValue = JSON.parse(cookieValue);
          setValue(parsedValue);
        } else {
          setValue(defaultValue);
        }
      } catch (error) {
        console.error(`Failed to sync cookie "${name}":`, error);
      }
    };

    // Listen for storage events (cookie changes from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [name, defaultValue]);

  return [value, setCookieValue, removeCookie];
}

export default useCookie;