import api from "./index.ts";

export interface LoginPayload {
  username: string;
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
  const res = await api.post("/v1/users/login", payload);
  return res.data;
};

export const register = async (payload: RegisterPayload) => {
  const res = await api.post("/v1/users/register", payload);
  return res.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const res = await api.post("/v1/users/forgot-password", payload);
  return res.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const res = await api.post("/v1/users/reset-password", payload);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/v1/users/me");
  return res.data;
};
