import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
  // Auth pages (public, no layout) - Dynamic routing
  route('/auth/:name', 'pages/auth/[name]/page.tsx'), // /auth/:name (login, register, sso-login, etc.)

  // Protected dashboard

  // Admin layout with protected subroutes
  route('/admin', 'layouts/AdminContentLayout.tsx', [
    route('', 'pages/admin/page.tsx'), // /admin
    route('profile', 'pages/admin/components/UserProfile.tsx'),
    // System management routes (including AI Management)
    route('system', 'pages/admin/system/page.tsx'), // /admin/system
    route('system/:name', 'pages/admin/system/[name]/page.tsx'), // /admin/system/:name (dynamic)
    route('system/:name/:command', 'pages/admin/system/[name]/[commandId]/page.tsx'), // /admin/system/:name/:command (tool command edit)

    // Gateway management routes
    route('gateway', 'pages/admin/gateway/page.tsx'), // /admin/gateway

    // Settings management routes
    route('settings', 'pages/admin/settings/page.tsx'), // /admin/settings
    route('settings/:name', 'pages/admin/settings/[name]/page.tsx'), // /admin/settings/:name (dynamic)
  ]),

  // Public blog pages - Dynamic routing
  route('/blog/:name', 'pages/blog/[name]/page.tsx'), // /blog/:name (dynamic - list/detail/:id)

  // Root redirect (redirect to dashboard if authenticated, login if not)
  route('/', 'pages/page.tsx'),
  route('/login', 'pages/auth/components/Login.tsx'),

  // 404 Not Found page (catch-all route)
  route('*', 'pages/components/NotFound.tsx'),
] satisfies RouteConfig;
