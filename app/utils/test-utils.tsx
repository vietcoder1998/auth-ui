import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  initialIndex?: number;
}

function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialEntries, initialIndex, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        {children}
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock document.cookie for tests
export const mockCookie = () => {
  let cookies: { [key: string]: string } = {};
  
  Object.defineProperty(document, 'cookie', {
    get: () => {
      return Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
    },
    set: (cookieString: string) => {
      const [nameValue] = cookieString.split(';');
      const [name, value] = nameValue.split('=');
      
      if (value === '' || cookieString.includes('expires=Thu, 01 Jan 1970')) {
        // Delete cookie
        delete cookies[name];
      } else {
        // Set cookie
        cookies[name] = value;
      }
    },
    configurable: true,
  });

  return {
    getCookies: () => cookies,
    clearCookies: () => { cookies = {}; },
    setCookie: (name: string, value: string) => { cookies[name] = value; },
  };
};

// Setup function for tests
export const setupTest = () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage
  localStorage.clear();
  
  // Setup cookie mock
  const cookieUtils = mockCookie();
  cookieUtils.clearCookies();
  
  return { cookieUtils };
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };