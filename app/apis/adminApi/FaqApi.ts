import { getApiInstance } from '../index.ts';

export const FaqApi = {
  getFaqs: async () => {
    const axios = getApiInstance();
    return axios.get('/admin/faqs');
  },
  createFaq: async (data: any) => {
    const axios = getApiInstance();
    return axios.post('/admin/faqs', data);
  },
  updateFaq: async (id: string, data: any) => {
    const axios = getApiInstance();
    return axios.put(`/admin/faqs/${id}`, data);
  },
  deleteFaq: async (id: string) => {
    const axios = getApiInstance();
    return axios.delete(`/admin/faqs/${id}`);
  },
};
