import { Form, Input, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import AIGenerateInput from '~/components/AIGenerateInput.tsx';

interface EditFaqModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  loading?: boolean;
  faq?: any;
  promptOptions: any[];
}

const EditFaqModal: React.FC<EditFaqModalProps> = ({
  open,
  onCancel,
  onOk,
  loading,
  faq,
  promptOptions,
}) => {
  const [form] = Form.useForm();
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(faq?.promptId);
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>(
    faq?.conversationId
  );
  const [aiAnswer, setAiAnswer] = useState(faq?.answer || '');

  useEffect(() => {
    if (faq) {
      form.setFieldsValue({ ...faq, promptId: faq.promptId, conversationId: faq.conversationId });
      setSelectedPrompt(faq.promptId);
      setSelectedConversation(faq.conversationId);
      setAiAnswer(faq.answer || '');
    }
  }, [faq, form]);

  // Simulate fetching conversation when prompt changes
  useEffect(() => {
    if (selectedPrompt && promptOptions.length > 0) {
      // Find the prompt and auto-select its conversation if available
      const promptObj = promptOptions.find((p) => p.value === selectedPrompt);
      if (promptObj && promptObj.conversationId) {
        setSelectedConversation(promptObj.conversationId);
        form.setFieldsValue({ conversationId: promptObj.conversationId });
      }
    }
  }, [selectedPrompt, promptOptions, form]);

  const handleFinish = (values: any) => {
    onOk({ ...faq, ...values, answer: aiAnswer });
  };

  return (
    <Modal
      open={open}
      title="Edit FAQ"
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={faq} onFinish={handleFinish}>
        <Form.Item
          name="question"
          label="Question"
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please enter the question' }]}
        >
          <AIGenerateInput
            value={form.getFieldValue('question') || ''}
            onChange={(val) => form.setFieldsValue({ question: val })}
            textarea
            rows={2}
            placeholder="Enter FAQ question"
            prompt={form.getFieldValue('question') || ''}
          />
        </Form.Item>
        <Form.Item label="Answer" style={{ flex: 1 }}>
          <AIGenerateInput
            value={aiAnswer}
            onChange={setAiAnswer}
            prompt={form.getFieldValue('answer') || ''}
            placeholder="Enter or generate answer..."
            textarea
            rows={3}
          />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'manual', label: 'Manual' },
              { value: 'agent', label: 'Agent' },
              { value: 'doc_input', label: 'Doc Input' },
            ]}
          />
        </Form.Item>
        <Form.Item name="promptId" label="Prompt">
          <Select
            showSearch
            options={promptOptions}
            value={selectedPrompt}
            onChange={(val) => setSelectedPrompt(val)}
            placeholder="Select a prompt"
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item name="conversationId" label="Conversation">
          <Input value={selectedConversation} disabled placeholder="Auto-selected by prompt" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFaqModal;
