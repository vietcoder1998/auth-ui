// JobApi.ts
// API methods for job management
import axios from 'axios';

export const JobApi = {
  getJobs: (): Promise<any> => axios.get('/api/admin/job'),
  createJob: (data: Record<string, any>): Promise<any> => axios.post('/api/admin/job', data),
  startJob: (id: string): Promise<any> => axios.post(`/api/admin/job/${id}/start`),
  restartJob: (id: string): Promise<any> => axios.post(`/api/admin/job/${id}/restart`),
  cancelJob: (id: string): Promise<any> => axios.post(`/api/admin/job/${id}/cancel`),
};
