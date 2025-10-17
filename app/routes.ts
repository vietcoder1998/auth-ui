import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  // Auth pages (public, no layout)
  route("/login", "pages/Login.tsx"),
  route("/sso/login", "pages/SSOLogin.tsx"),
  route("/sso/login-success", "pages/SSOLoginSuccess.tsx"),
  route("/register", "pages/Register.tsx"),
  route("/forgot-password", "pages/ForgotPassword.tsx"),
  route("/reset-password", "pages/ResetPassword.tsx"),
  route("/login-success", "pages/LoginSuccess.tsx"),
  route("/token-validation", "pages/system/TokenValidationPage.tsx"), // Token validation for admin impersonation

  // Protected dashboard
  route("/dashboard", "pages/Dashboard.tsx"),

  // Admin layout with protected subroutes
  route("/admin", "layouts/AdminContentLayout.tsx", [
    route("", "pages/AdminIndexPage.tsx"), // /admin
    
    // System management routes (including AI Management)
    route("system", "pages/system/AdminSystemIndexPage.tsx"), // /admin/system
    route("system/users", "pages/system/AdminUserPage.tsx"), // /admin/system/users
    route("system/tokens", "pages/system/AdminTokenPage.tsx"), // /admin/system/tokens
    route("system/roles", "pages/system/AdminRolePage.tsx"), // /admin/system/roles
    route("system/permissions", "pages/system/AdminPermissionPage.tsx"), // /admin/system/permissions
    route("system/sso", "pages/system/AdminSSOPage.tsx"), // /admin/system/sso
    route("system/login-history", "pages/system/AdminLoginHistoryPage.tsx"), // /admin/system/login-history
    route("system/logic-history", "pages/system/AdminLogicHistoryPage.tsx"), // /admin/system/logic-history
    route("system/cache", "pages/system/AdminCachePage.tsx"), // /admin/system/cache
    route("system/logs", "pages/system/AdminLogPage.tsx"), // /admin/system/logs
    route("system/agents", "pages/system/AdminAgentPage.tsx"), // /admin/system/agents
    route("system/conversations", "pages/system/AdminConversationList.tsx"), // /admin/system/conversations
    
    // Settings management routes
    route("settings", "pages/settings/AdminSettingsIndexPage.tsx"), // /admin/settings
    route("settings/api-keys", "pages/settings/AdminApiKeysPage.tsx"), // /admin/settings/api-keys
    route("settings/mail", "pages/settings/AdminMailPage.tsx"), // /admin/settings/mail
    route("settings/notifications", "pages/settings/AdminNotificationPage.tsx"), // /admin/settings/notifications
    route("settings/config", "pages/settings/AdminConfigPage.tsx"), // /admin/settings/config
    route("settings/seed", "pages/settings/AdminSeedPage.tsx"), // /admin/settings/seed
  ]),

  // Root redirect (redirect to dashboard if authenticated, login if not)
  route("/", "pages/Home.tsx"),

  // 404 Not Found page (catch-all route)
  route("*", "pages/NotFound.tsx"),
] satisfies RouteConfig;
