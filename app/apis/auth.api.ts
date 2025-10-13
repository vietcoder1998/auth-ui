import { getApiInstance } from "./index.ts";

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
  const api = getApiInstance();
  const res = await api.post("/users:login", payload);
  return res.data;
};

export const register = async (payload: RegisterPayload) => {
  const api = getApiInstance();
  const res = await api.post("/users:register", payload);
  return res.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const api = getApiInstance();
  const res = await api.post("/users:forgot-password", payload);
  return res.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const api = getApiInstance();
  const res = await api.post("/users:reset-password", payload);
  return res.data;
};

export const getMe = async () => {
  const api = getApiInstance();
  const res = await api.get("/users/me");
  return res.data;
};
