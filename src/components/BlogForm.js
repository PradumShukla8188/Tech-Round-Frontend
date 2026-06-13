import { useState, useMemo } from 'react';
import FormField from './FormField';
import { useFormValidation } from '../hooks/useFormValidation';
import { required } from '../utils/validators';

const BlogForm = ({
  onSubmit,
  initialData = {},
  submitLabel = 'Add Blog',
  onCancel,
  inModal = false,
}) => {
  const [loading, setLoading] = useState(false);

  const validators = useMemo(
    () => ({
      title: [required('Title is required')],
      content: [required('Content is required')],
    }),
    []
  );

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
    resetForm,
  } = useFormValidation(
    { title: initialData.title || '', content: initialData.content || '' },
    validators
  );

  const onFormSubmit = handleSubmit(async (formValues) => {
    setLoading(true);
    try {
      await onSubmit({
        title: formValues.title.trim(),
        content: formValues.content.trim(),
      });
      if (!initialData.title) {
        resetForm({ title: '', content: '' });
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <form
      className={`blog-form ${inModal ? 'blog-form--modal' : 'card'}`}
      onSubmit={onFormSubmit}
      noValidate
    >
      {!inModal && (
        <h3>{initialData.title ? 'Edit Blog' : 'Add New Blog'}</h3>
      )}
      <FormField label="Title" name="title" error={getFieldError('title')} required>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          placeholder="Blog title"
        />
      </FormField>
      <FormField label="Content" name="content" error={getFieldError('content')} required>
        <textarea
          id="content"
          value={values.content}
          onChange={(e) => handleChange('content', e.target.value)}
          onBlur={() => handleBlur('content')}
          placeholder="Write your blog content..."
          rows={5}
        />
      </FormField>
      <div className={onCancel ? 'form-actions' : ''}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline-dark" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default BlogForm;
