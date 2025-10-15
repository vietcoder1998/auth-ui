import { getApiInstance } from "./index.ts";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;    
  password: string;
}

export const login = async (payload: LoginPayload) => {
  const api = getApiInstance();
  const res = await api.post("/auth/login", payload);
  return res.data;
};

export const register = async (payload: RegisterPayload) => {
  const api = getApiInstance();
  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const api = getApiInstance();
  const res = await api.post("/auth/forgot-password", payload);
  return res.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const api = getApiInstance();
  const res = await api.post("/auth/reset-password", payload);
  return res.data;
};

export const getMe = async () => {
  const api = getApiInstance();
  const res = await api.get("/auth/me");
  return res.data;
};

export interface SSOLoginPayload {
  ssoKey: string;
  deviceIP?: string;
  userAgent?: string;
  location?: string;
}

export const ssoLogin = async (payload: SSOLoginPayload) => {
  const api = getApiInstance();
  const res = await api.post("/sso-auth/login", {
    deviceIP: payload.deviceIP || '127.0.0.1',
    userAgent: payload.userAgent || navigator.userAgent,
    location: payload.location || 'Web App',
  }, {
    headers: {
      'x-sso-key': payload.ssoKey,
    }
  });
  return res.data;
};

export const validateSSOKey = async (ssoKey: string) => {
  const api = getApiInstance();
  const res = await api.post("/sso-auth/validate-key", {
    ssoKey: ssoKey
  });
  return res.data;
};

export const validateToken = async (token: string) => {
  const api = getApiInstance();
  const res = await api.post("/auth/validate", { token });
  return res.data;
};
