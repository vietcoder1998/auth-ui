import { getApiInstance } from '../index.ts';

export class TokenApi {
  static async getTokens(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/tokens', { params });
  }
  static async createToken(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/tokens', data);
  }
  static async grantToken(userId: string) {
    const axios = getApiInstance();
    return axios.post('/admin/tokens/grant', { userId });
  }
  static async revokeToken(tokenId: string) {
    const axios = getApiInstance();
    return axios.post('/admin/tokens/revoke', { tokenId });
  }
}
