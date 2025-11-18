// Public Blog API
// Handles fetches to /api/public/blogs endpoints

import { getApiInstance } from '../index.ts';

const BASE_URL = '/public/blogs';

export const PublicBlogApi = {
  getBlogs(params?: any) {
    return getApiInstance().get(BASE_URL, { params });
  },
  getBlog(id: any) {
    return getApiInstance().get(`${BASE_URL}/${id}`);
  },
  createBlog(data: any) {
    return getApiInstance().post(BASE_URL, data);
  },
  updateBlog(id: any, data: any) {
    return getApiInstance().put(`${BASE_URL}/${id}`, data);
  },
  deleteBlog(id: any) {
    return getApiInstance().delete(`${BASE_URL}/${id}`);
  },
};
