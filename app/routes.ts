import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  // Auth pages (không layout)
  route("/login", "pages/Login.tsx"),
  route("/register", "pages/Register.tsx"),
  route("/forgot-password", "pages/ForgotPassword.tsx"),
  route("/reset-password", "pages/ResetPassword.tsx"),
  route("/login-success", "pages/LoginSuccess.tsx"),

  // Admin layout có các trang con
  route("/admin", "layouts/AdminLayout.tsx", [
    route("", "pages/AdminIndexPage.tsx"), // /admin
    route("users", "pages/AdminUserPage.tsx"), // /admin/users
    route("tokens", "pages/AdminTokenPage.tsx"), // /admin/tokens
    route("roles", "pages/AdminRolePage.tsx"),
    route("permissions", "pages/AdminPermissionPage.tsx"),
    route("mail", "pages/AdminMailPage.tsx"),
    route("notifications", "pages/AdminNotificationPage.tsx"),
    route("config", "pages/AdminConfigPage.tsx"),
    route("cache", "pages/AdminCachePage.tsx"), // /admin/cache
  ]),

  // 404 Not Found page (catch-all route)
  route("*", "pages/NotFound.tsx"),
] satisfies RouteConfig;
