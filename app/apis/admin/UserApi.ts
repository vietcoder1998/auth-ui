import { BaseApi } from '../base.ts';

export class UserApi extends BaseApi {
  constructor() {
    super('/admin/users');
  }

  // Custom methods beyond CRUD
  async loginAsUser(email: string) {
    return this.customPost('/login-as', { email });
  }

  async validateUserToken(token: string) {
    return this.customPost('/validate-token', { token });
  }

  // Static methods for backward compatibility
  static async getUsers(params?: any) {
    return BaseApi.staticGetAll('/admin/users', params);
  }

  static async createUser(data: any) {
    return BaseApi.staticCreate('/admin/users', data);
  }

  static async updateUser(email: string, data: any) {
    return BaseApi.staticUpdate('/admin/users', email, data);
  }

  static async deleteUser(email: string) {
    return BaseApi.staticDelete('/admin/users', email);
  }

  static async loginAsUser(email: string) {
    const instance = new UserApi();
    return instance.loginAsUser(email);
  }

  static async validateUserToken(token: string) {
    const instance = new UserApi();
    return instance.validateUserToken(token);
  }
}

export const UserApiInstance = new UserApi();
