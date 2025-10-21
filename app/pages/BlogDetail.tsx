import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicApi } from '../apis/public.api.ts';
import DefaultLayout from '../layouts/DefaultLayout.tsx';
import { Spin, Tag } from 'antd';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      publicApi
        .getBlog(id)
        .then((res) => setBlog(res.data.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow text-center">
          <Spin />
        </div>
      </DefaultLayout>
    );
  }

  if (!blog) {
    return (
      <DefaultLayout>
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow text-center">
          <h2>Blog not found</h2>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <button
          onClick={() => navigate('/blog')}
          className="mb-4 px-4 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm"
        >
          ← Back to Blog
        </button>
        <h1 className="text-2xl font-bold mb-2">{blog.title}</h1>
        <div className="text-xs text-gray-400 mb-2">
          {blog.date && new Date(blog.date).toLocaleDateString()}
        </div>
        <div className="mb-4">
          <Tag color="blue">{blog.category?.name}</Tag>
          {blog.author && <Tag color="green">{blog.author}</Tag>}
        </div>
        <div
          className="text-gray-700 text-base"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </DefaultLayout>
  );
};

export default BlogDetail;
