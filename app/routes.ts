import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/login", "pages/Login.tsx"),
  route("/register", "pages/Register.tsx"),
  route("/forgot-password", "pages/ForgotPassword.tsx"),
  route("/reset-password", "pages/ResetPassword.tsx"),
  route("/login-success", "pages/LoginSuccess.tsx"),
] satisfies RouteConfig;
