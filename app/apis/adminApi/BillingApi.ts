import { getApiInstance } from '../index.ts';

const API_URL = '/admin/billings';

export const BillingApi = {
  getBillings: (search?: string) => {
    const axios = getApiInstance();
    return axios.get(API_URL, { params: search ? { search } : {} });
  },
  createBilling: (data: any) => {
    const axios = getApiInstance();
    return axios.post(API_URL, data);
  },
  updateBilling: (id: string, data: any) => {
    const axios = getApiInstance();
    return axios.put(`${API_URL}/${id}`, data);
  },
  deleteBilling: (id: string) => {
    const axios = getApiInstance();
    return axios.delete(`${API_URL}/${id}`);
  },
};
