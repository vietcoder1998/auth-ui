import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
  // Auth pages (public, no layout)
  route('/login', 'pages/Login.tsx'),
  route('/sso/login', 'pages/SSOLogin.tsx'),
  route('/sso/login-success', 'pages/SSOLoginSuccess.tsx'),
  route('/register', 'pages/Register.tsx'),
  route('/forgot-password', 'pages/ForgotPassword.tsx'),
  route('/reset-password', 'pages/ResetPassword.tsx'),
  route('/login-success', 'pages/LoginSuccess.tsx'),
  route('/token-validation', 'pages/TokenValidationPage.tsx'), // Token validation for admin impersonation

  // Protected dashboard

  // Admin layout with protected subroutes
  route('/admin', 'layouts/AdminContentLayout.tsx', [
    route('', 'pages/AdminIndexPage.tsx'), // /admin
    route('profile', 'pages/Dashboard.tsx'),

    // Blog management
    route('blog/:name', 'pages/blog/[name]/page.tsx'), // /admin/blog/:name (dynamic)

    // System management routes (including AI Management)
    route('system', 'pages/system/page.tsx'), // /admin/system
    route('system/:name', 'pages/system/[name]/page.tsx'), // /admin/system/:name (dynamic)

    // Settings management routes
    route('settings', 'pages/settings/page.tsx'), // /admin/settings
    route('settings/:name', 'pages/settings/[name]/page.tsx'), // /admin/settings/:name (dynamic)
  ]),

  // Blog page
  route('/blog', 'pages/Blog.tsx'),
  route('/blog/:id', 'pages/BlogDetail.tsx'),

  // Root redirect (redirect to dashboard if authenticated, login if not)
  route('/', 'pages/Home.tsx'),

  // 404 Not Found page (catch-all route)
  route('*', 'pages/NotFound.tsx'),
] satisfies RouteConfig;
