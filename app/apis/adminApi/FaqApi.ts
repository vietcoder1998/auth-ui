import { getApiInstance } from '../index.ts';

export const FaqApi = {
  getFaqs: async (search?: string) => {
    const axios = getApiInstance();
    const params = search ? { params: { q: search } } : undefined;
    return axios.get('/admin/faqs', params);
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
