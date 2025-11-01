// FileApi.ts
// API methods for file management
import { getApiInstance } from '../index.ts';

export const FileApi = {
  getFiles: () => getApiInstance().get('/admin/files'),
};
