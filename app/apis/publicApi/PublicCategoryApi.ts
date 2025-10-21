// Public Category API
// Handles fetches to /api/public/categories endpoints

import { getApiInstance } from '../index.ts';

const BASE_URL = '/public/categories';

export const PublicCategoryApi = {
  getCategories() {
    return getApiInstance().get(BASE_URL);
  },
  getCategory(id: any) {
    return getApiInstance().get(`${BASE_URL}/${id}`);
  },
  createCategory(data: any) {
    return getApiInstance().post(BASE_URL, data);
  },
  updateCategory(id: any, data: any) {
    return getApiInstance().put(`${BASE_URL}/${id}`, data);
  },
  deleteCategory(id: any) {
    return getApiInstance().delete(`${BASE_URL}/${id}`);
  },
};
