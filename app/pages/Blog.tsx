import React, { useEffect, useState } from 'react';
import { publicApi } from '../apis/public.api.ts';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout.tsx';

const Blog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    publicApi
      .getBlogs()
      .then((res) => setBlogs(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    'All',
    ...Array.from(new Set(blogs.map((post) => post.category?.name || 'Uncategorized'))),
  ].filter(Boolean);

  const filteredPosts = blogs.filter(
    (post) =>
      (selectedCategory === 'All' || post.category?.name === selectedCategory) &&
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
                  key={post.id}
                  className="p-4 bg-gray-50 rounded border border-gray-200 shadow-sm cursor-pointer hover:bg-blue-50"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <div className="font-bold text-blue-700 text-lg mb-1">{post.title}</div>
                  <div className="text-xs text-gray-400 mb-2">
                    {post.date && new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="text-gray-700 text-sm mb-2 line-clamp-3">{post.content}</div>
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                    {post.category?.name || 'Uncategorized'}
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
