import { getApiInstance } from '../index.ts';

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

export interface SSOLoginPayload {
  ssoKey: string;
  deviceIP?: string;
  userAgent?: string;
  location?: string;
}

export class AuthApi {
  public async loginUser(payload: LoginPayload) {
    const api = getApiInstance();
    const res = await api.post('/auth/login', payload);
    return res.data;
  }

  public async register(payload: RegisterPayload) {
    const api = getApiInstance();
    const res = await api.post('/auth/register', payload);
    return res.data;
  }

  public async forgotPassword(payload: ForgotPasswordPayload) {
    const api = getApiInstance();
    const res = await api.post('/auth/forgot-password', payload);
    return res.data;
  }

  public async resetPassword(payload: ResetPasswordPayload) {
    const api = getApiInstance();
    const res = await api.post('/auth/reset-password', payload);
    return res.data;
  }

  public async getMe() {
    const api = getApiInstance();
    const res = await api.get('/auth/me');
    return res.data;
  }

  public async ssoLogin(payload: SSOLoginPayload) {
    const api = getApiInstance();
    const res = await api.post(
      '/sso-auth/login',
      {
        deviceIP: payload.deviceIP || '127.0.0.1',
        userAgent: payload.userAgent || navigator.userAgent,
        location: payload.location || 'Web App',
      },
      {
        headers: {
          'x-sso-key': payload.ssoKey,
        },
      }
    );
    return res.data;
  }
}

export const authApi = new AuthApi();
