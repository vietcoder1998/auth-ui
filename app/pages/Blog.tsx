import React from 'react';
import DefaultLayout from '../layouts/DefaultLayout.tsx';

const blogPosts = [
  {
    title: 'Getting Started with Auth System',
    date: '2025-10-01',
    content: 'Learn how to register, login, and explore the dashboard features.',
    category: 'Getting Started',
  },
  {
    title: 'Managing Users and Roles',
    date: '2025-10-10',
    content: 'Tips for admins on managing users, roles, and permissions.',
    category: 'Admin',
  },
  {
    title: 'Integrating SSO and API Keys',
    date: '2025-10-15',
    content: 'How to set up Single Sign-On and use API keys for integrations.',
    category: 'Integration',
  },
];

import { useState } from 'react';

const Blog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(blogPosts.map((post) => post.category)))];

  const filteredPosts = blogPosts.filter(
    (post) =>
      (selectedCategory === 'All' || post.category === selectedCategory) &&
      (post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Auth System Blog</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Blog List (Left) */}
          <div className="flex-1">
            <div className="mb-4 flex justify-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blog posts..."
                className="border rounded px-3 py-1 w-full max-w-md text-sm"
              />
            </div>
            <div className="space-y-6">
              {filteredPosts.length === 0 && (
                <div className="text-center text-gray-400 py-8">No blog posts found.</div>
              )}
              {filteredPosts.map((post) => (
                <div
                  key={post.title}
                  className="p-4 bg-gray-50 rounded border border-gray-200 shadow-sm"
                >
                  <div className="font-bold text-blue-700 text-lg mb-1">{post.title}</div>
                  <div className="text-xs text-gray-400 mb-2">{post.date}</div>
                  <div className="text-gray-700 text-sm mb-2">{post.content}</div>
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                    {post.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Category List (Right) */}
          <div className="w-full md:w-48">
            <div className="font-semibold text-gray-700 mb-2">Categories</div>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1 rounded text-sm border ${selectedCategory === cat ? 'bg-blue-100 text-blue-700 border-blue-300 font-bold' : 'bg-gray-50 text-gray-700 border-gray-200'} transition`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Blog;
