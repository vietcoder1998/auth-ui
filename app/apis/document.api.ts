import { getApiInstance } from './index.ts';

export const documentApi = {
  async listDocuments(params?: any) {
    const axios = getApiInstance();
    return axios.get('/admin/documents', { params });
  },
  async getDocument(id: string) {
    const axios = getApiInstance();
    return axios.get(`/admin/documents/${id}`);
  },
  async createDocument(data: any) {
    const axios = getApiInstance();
    return axios.post('/admin/documents', data);
  },
  async updateDocument(id: string, data: any) {
    const axios = getApiInstance();
    return axios.put(`/admin/documents/${id}`, data);
  },
  async deleteDocument(id: string) {
    const axios = getApiInstance();
    return axios.delete(`/admin/documents/${id}`);
  },
  async uploadFile(formData: FormData) {
    const axios = getApiInstance();
    return axios.post('/admin/files/upload', formData, {
      headers: {
        // Do NOT set 'Content-Type' manually!
        'Content-Type': 'multipart/form-data', // let axios/browser set this
      },
    });
  },
};
