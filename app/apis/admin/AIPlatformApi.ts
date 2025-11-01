import { getApiInstance } from '../index.ts';

const API_URL = '/admin/ai-platforms';

export const AIPlatformApi = {
  getAIPlatforms: (search?: string) => {
    const axios = getApiInstance();
    return axios.get(API_URL, { params: search ? { search } : {} });
  },
  createAIPlatform: (data: any) => {
    const axios = getApiInstance();
    return axios.post(API_URL, data);
  },
  updateAIPlatform: (id: string, data: any) => {
    const axios = getApiInstance();
    return axios.put(`${API_URL}/${id}`, data);
  },
  deleteAIPlatform: (id: string) => {
    const axios = getApiInstance();
    return axios.delete(`${API_URL}/${id}`);
  },
};
