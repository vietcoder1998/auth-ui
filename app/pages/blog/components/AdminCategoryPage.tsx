import React, { useEffect, useState } from 'react';
import { publicApi } from '../../../apis/public.api.ts';
import { Table, Button, Modal, Input, Form, message, Space, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await publicApi.getCategories();
      setCategories(res.data.data);
    } catch {
      setCategories([]);
    }
    setLoading(false);
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    form.setFieldsValue(cat);
    setModalVisible(true);
  };

  const handleDelete = (cat: any) => {
    Modal.confirm({
      title: 'Delete Category',
      content: `Are you sure you want to delete "${cat.name}"?`,
      onOk: async () => {
        await publicApi.deleteCategory(cat.id);
        fetchCategories();
        message.success('Category deleted');
      },
    });
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await publicApi.updateCategory(editingCategory.id, values);
        message.success('Category updated');
      } else {
        await publicApi.createCategory(values);
        message.success('Category created');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (e) {
      message.error('Failed to save category');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, cat: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(cat)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(cat)} />
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
        <h2 style={{ margin: 0 }}>Category Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Category
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
      <Modal
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input category name!' }]}
          >
            {' '}
            <Input />{' '}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
