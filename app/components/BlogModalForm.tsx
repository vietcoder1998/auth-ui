import React from 'react';
import { Form, Input } from 'antd';
import { RichText } from '../lib/RichText.tsx';

type Category = {
  id: string;
  name: string;
};

type Blog = {
  id?: string;
  title?: string;
  content?: string;
  categoryId?: string;
  [key: string]: any;
};

interface BlogModalFormProps {
  form: any;
  categories: Category[];
  initialValues?: Blog | null;
}

const BlogModalForm: React.FC<BlogModalFormProps> = ({ form, categories, initialValues }) => {
  return (
    <Form form={form} layout="vertical" initialValues={initialValues || {}}>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please input title!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true, message: 'Please input content!' }]}
      >
        <RichText
          value={form.getFieldValue('content') || ''}
          onChange={(v) => form.setFieldsValue({ content: v })}
          style={{ minHeight: 120 }}
        />
      </Form.Item>
      <Form.Item
        name="categoryId"
        label="Category"
        rules={[{ required: true, message: 'Please select category!' }]}
      >
        <select className="ant-input">
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Form.Item>
      {/* Author is auto-detected, not shown */}
    </Form>
  );
};

export default BlogModalForm;
