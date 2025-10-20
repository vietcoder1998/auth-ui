// Custom hook for login cookie (auth_user)
export function useLoginCookie(): [string | undefined, (value: string) => void, () => void] {
  const [value, setValue] = useState<string | undefined>(() => {
    try {
      return Cookies.get('auth_user');
    } catch {
      return undefined;
    }
  });

  const setCookieValue = (newValue: string) => {
    setValue(newValue);
    Cookies.set('auth_user', newValue, { expires: 1 });
  };

  const removeCookie = () => {
    setValue(undefined);
    Cookies.remove('auth_user');
  };

  useEffect(() => {
    // Sync with cookie changes from other tabs/windows
    const handleStorageChange = () => {
      setValue(Cookies.get('auth_user'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return [value, setCookieValue, removeCookie];
}

// Custom hook for boolean cookies
export function useBooleanCookie(
  name: string,
  defaultValue: boolean,
  options: UseCookieOptions = {}
): [boolean, (value: boolean) => void, () => void] {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const cookieValue = Cookies.get(name);
      if (cookieValue !== undefined) {
        return cookieValue === 'true';
      }
    } catch (error) {
      console.error(`Failed to parse boolean cookie "${name}":`, error);
    }
    return defaultValue;
  });

  const setCookieValue = (newValue: boolean) => {
    try {
      setValue(newValue);
      Cookies.set(name, newValue.toString(), {
        expires: options.expires || 365,
        path: options.path || '/',
        domain: options.domain,
        secure: options.secure,
        sameSite: options.sameSite || 'lax',
      });
    } catch (error) {
      console.error(`Failed to set boolean cookie "${name}":`, error);
    }
  };

  const removeCookie = () => {
    setValue(defaultValue);
    Cookies.remove(name, {
      path: options.path || '/',
      domain: options.domain,
    });
  };

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const cookieValue = Cookies.get(name);
        if (cookieValue !== undefined) {
          setValue(cookieValue === 'true');
        } else {
          setValue(defaultValue);
        }
      } catch (error) {
        console.error(`Failed to sync boolean cookie "${name}":`, error);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [name, defaultValue]);

  return [value, setCookieValue, removeCookie];
}

// Custom hook for string cookies
export function useStringCookie(
  name: string,
  defaultValue: string,
  options: UseCookieOptions = {}
): [string, (value: string) => void, () => void] {
  const [value, setValue] = useState<string>(() => {
    try {
      const cookieValue = Cookies.get(name);
      if (cookieValue !== undefined) {
        return cookieValue;
      }
    } catch (error) {
      console.error(`Failed to parse string cookie "${name}":`, error);
    }
    return defaultValue;
  });

  const setCookieValue = (newValue: string) => {
    try {
      setValue(newValue);
      Cookies.set(name, newValue, {
        expires: options.expires || 365,
        path: options.path || '/',
        domain: options.domain,
        secure: options.secure,
        sameSite: options.sameSite || 'lax',
      });
    } catch (error) {
      console.error(`Failed to set string cookie "${name}":`, error);
    }
  };

  const removeCookie = () => {
    setValue(defaultValue);
    Cookies.remove(name, {
      path: options.path || '/',
      domain: options.domain,
    });
  };

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const cookieValue = Cookies.get(name);
        if (cookieValue !== undefined) {
          setValue(cookieValue);
        } else {
          setValue(defaultValue);
        }
      } catch (error) {
        console.error(`Failed to sync string cookie "${name}":`, error);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [name, defaultValue]);

  return [value, setCookieValue, removeCookie];
}
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
        sameSite: options.sameSite || 'lax',
      });
    } catch (error) {
      console.error(`Failed to set cookie "${name}":`, error);
    }
  };

  const removeCookie = () => {
    setValue(defaultValue);
    Cookies.remove(name, {
      path: options.path || '/',
      domain: options.domain,
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
