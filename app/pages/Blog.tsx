import React from 'react';
import DefaultLayout from '../layouts/DefaultLayout.tsx';

const blogPosts = [
  {
    title: 'Getting Started with Auth System',
    date: '2025-10-01',
    content: 'Learn how to register, login, and explore the dashboard features.',
  },
  {
    title: 'Managing Users and Roles',
    date: '2025-10-10',
    content: 'Tips for admins on managing users, roles, and permissions.',
  },
  {
    title: 'Integrating SSO and API Keys',
    date: '2025-10-15',
    content: 'How to set up Single Sign-On and use API keys for integrations.',
  },
];

const Blog: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Auth System Blog</h1>
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <div
              key={post.title}
              className="p-4 bg-gray-50 rounded border border-gray-200 shadow-sm"
            >
              <div className="font-bold text-blue-700 text-lg mb-1">{post.title}</div>
              <div className="text-xs text-gray-400 mb-2">{post.date}</div>
              <div className="text-gray-700 text-sm">{post.content}</div>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Blog;
