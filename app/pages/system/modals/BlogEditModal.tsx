import React from 'react';
import { Modal } from 'antd';
import BlogModalForm from '../../../components/BlogModalForm.tsx';

interface BlogEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  form: any;
  categories: any[];
  initialValues: any;
}

const BlogEditModal: React.FC<BlogEditModalProps> = ({
  visible,
  onCancel,
  onOk,
  form,
  categories,
  initialValues,
}) => (
  <Modal
    title={initialValues ? 'Edit Blog' : 'Create Blog'}
    open={visible}
    onCancel={onCancel}
    onOk={onOk}
    width={600}
    destroyOnClose
  >
    <BlogModalForm form={form} categories={categories} initialValues={initialValues} />
  </Modal>
);

export default BlogEditModal;
