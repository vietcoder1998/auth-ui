import { getApiInstance } from '../index.ts';

export const SystemApi = {
  restartServer: async () => {
    const api = getApiInstance();
    return api.post('/admin/system/restart');
  },
};
