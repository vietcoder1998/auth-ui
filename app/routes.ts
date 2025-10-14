import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  // Auth pages (public, no layout)
  route("/login", "pages/Login.tsx"),
  route("/register", "pages/Register.tsx"),
  route("/forgot-password", "pages/ForgotPassword.tsx"),
  route("/reset-password", "pages/ResetPassword.tsx"),
  route("/login-success", "pages/LoginSuccess.tsx"),

  // Protected dashboard
  route("/dashboard", "pages/Dashboard.tsx"),

  // Admin layout with protected subroutes
  route("/admin", "layouts/AdminLayout.tsx", [
    route("", "pages/AdminIndexPage.tsx"), // /admin
    
    // System management routes
    route("system", "layouts/AdminSystemLayout.tsx", [
      route("", "pages/system/AdminSystemIndexPage.tsx"), // /admin/system
      route("users", "pages/system/AdminUserPage.tsx"), // /admin/system/users
      route("tokens", "pages/system/AdminTokenPage.tsx"), // /admin/system/tokens
      route("roles", "pages/system/AdminRolePage.tsx"), // /admin/system/roles
      route("permissions", "pages/system/AdminPermissionPage.tsx"), // /admin/system/permissions
      route("cache", "pages/system/AdminCachePage.tsx"), // /admin/system/cache
    ]),
    
    // Settings management routes
    route("settings", "layouts/AdminSettingsLayout.tsx", [
      route("", "pages/settings/AdminSettingsIndexPage.tsx"), // /admin/settings
      route("mail", "pages/settings/AdminMailPage.tsx"), // /admin/settings/mail
      route("notifications", "pages/settings/AdminNotificationPage.tsx"), // /admin/settings/notifications
      route("config", "pages/settings/AdminConfigPage.tsx"), // /admin/settings/config
    ]),
  ]),

  // Root redirect (redirect to dashboard if authenticated, login if not)
  route("/", "pages/Home.tsx"),

  // 404 Not Found page (catch-all route)
  route("*", "pages/NotFound.tsx"),
] satisfies RouteConfig;
