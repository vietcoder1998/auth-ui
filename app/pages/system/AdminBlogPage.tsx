import React, { useEffect, useState } from 'react';
import { publicApi } from '../../apis/public.api.ts';
import { Table, Button, Modal, Input, Form, Select, Tag, Space, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

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

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await publicApi.getBlogs();
      setBlogs(res.data);
    } catch {
      setBlogs([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await publicApi.getCategories();
      setCategories(res.data);
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
      content: `Are you sure you want to delete "${blog.title}"?`,
      onOk: async () => {
        await publicApi.deleteBlog(blog.id);
        fetchBlogs();
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
      if (editingBlog) {
        await publicApi.updateBlog(editingBlog.id, values);
        message.success('Blog updated');
      } else {
        await publicApi.createBlog(values);
        message.success('Blog created');
      }
      setModalVisible(false);
      fetchBlogs();
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Blog Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Blog
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table dataSource={blogs} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>
      <Modal
        title={editingBlog ? 'Edit Blog' : 'Create Blog'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input title!' }]}
          >
            {' '}
            <Input />{' '}
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please input content!' }]}
          >
            {' '}
            <Input.TextArea rows={4} />{' '}
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            {' '}
            <Select>
              {categories.map((cat: Category) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>{' '}
          </Form.Item>
          <Form.Item name="author" label="Author">
            {' '}
            <Input />{' '}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
