import React, { useEffect, useState } from 'react';
import { publicApi } from '~/apis/public.api.ts';
import { Table, Button, Modal, Tag, Space, Spin, message, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import BlogModalForm from '../../../../components/BlogModalForm.tsx';
import BlogEditModal from '../../../blog/modals/BlogEditModal.tsx';

interface Category {
  id: string;
  name: string;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  category?: Category;
  author?: string;
  date?: string;
}

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async (searchValue = '') => {
    setLoading(true);
    try {
      const params = searchValue ? { search: searchValue } : {};
      const res = await publicApi.getBlogs(params);
      setBlogs(res.data.data);
    } catch {
      setBlogs([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await publicApi.getCategories();
      setCategories(res.data.data);
    } catch {
      setCategories([]);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    form.setFieldsValue(blog);
    setModalVisible(true);
  };

  const handleDelete = async (blog: Blog) => {
    Modal.confirm({
      title: 'Delete Blog',
      content: `Are you sure you want to delete "${blog.title}"? This action cannot be undone!`,
      okType: 'danger',
      okText: 'Delete',
      cancelText: 'Cancel',
      icon: <DeleteOutlined style={{ color: 'red' }} />,
      onOk: async () => {
        await publicApi.deleteBlog(blog.id);
        fetchBlogs(search);
        message.success('Blog deleted');
      },
    });
  };

  const handleCreate = () => {
    setEditingBlog(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Auto-detect author from localStorage/cookie
      let author = values.author;
      if (!author) {
        author = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user') || '{}').nickname
          : '';
        if (!author) {
          const userCookie = document.cookie
            .split(';')
            .find((c) => c.trim().startsWith('auth_user='));
          if (userCookie) {
            try {
              author = JSON.parse(decodeURIComponent(userCookie.split('=')[1])).nickname || '';
            } catch {}
          }
        }
      }
      const payload = { ...values, author };
      if (editingBlog) {
        await publicApi.updateBlog(editingBlog.id, payload);
        message.success('Blog updated');
      } else {
        await publicApi.createBlog(payload);
        message.success('Blog created');
      }
      setModalVisible(false);
      fetchBlogs(search);
    } catch (e) {
      message.error('Failed to save blog');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (_text: string, record: Blog) => record.category?.name || '-',
    },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => date && new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, blog: Blog) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(blog)} />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(blog)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <CommonSearch
          searchPlaceholder="Search blogs..."
          searchValue={search}
          onSearch={(val) => {
            setSearch(val);
            fetchBlogs(val);
          }}
          onRefresh={() => fetchBlogs(search)}
          loading={loading}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Create Blog
            </Button>
          }
        />
      </div>
      <Spin spinning={loading}>
        <Table dataSource={blogs} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>
      <BlogEditModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        form={form}
        categories={categories}
        initialValues={editingBlog}
      />
    </div>
  );
}
