// JobApi.ts
// API methods for job management
import { getApiInstance } from '../index.ts';

export const JobApi = {
  getJobs: (): Promise<any> => {
    const api = getApiInstance();
    return api.get('/admin/jobs');
  },
  createJob: (data: Record<string, any>): Promise<any> => {
    const api = getApiInstance();
    return api.post('/admin/jobs', data);
  },
  startJob: (id: string): Promise<any> => {
    const api = getApiInstance();
    return api.post(`/admin/jobs/${id}/start`);
  },
  restartJob: (id: string): Promise<any> => {
    const api = getApiInstance();
    return api.post(`/admin/jobs/${id}/restart`);
  },
  cancelJob: (id: string): Promise<any> => {
    const api = getApiInstance();
    return api.post(`/admin/jobs/${id}/cancel`);
  },
};
