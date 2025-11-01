// Public API for Blog and Category (no auth)
// Structure mirrors admin/index.ts but only for public blog/category endpoints

import { PublicBlogApi } from './publicApi/PublicBlogApi.ts';
import { PublicCategoryApi } from './publicApi/PublicCategoryApi.ts';

export { PublicBlogApi, PublicCategoryApi };

export const publicApi = {
  // Blog
  getBlogs: PublicBlogApi.getBlogs,
  getBlog: PublicBlogApi.getBlog,
  createBlog: PublicBlogApi.createBlog,
  updateBlog: PublicBlogApi.updateBlog,
  deleteBlog: PublicBlogApi.deleteBlog,
  // Category
  getCategories: PublicCategoryApi.getCategories,
  getCategory: PublicCategoryApi.getCategory,
  createCategory: PublicCategoryApi.createCategory,
  updateCategory: PublicCategoryApi.updateCategory,
  deleteCategory: PublicCategoryApi.deleteCategory,
};
