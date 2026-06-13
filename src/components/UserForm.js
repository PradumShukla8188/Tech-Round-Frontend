import { useMemo, useState } from 'react';
import FormField from './FormField';
import PasswordInput from './PasswordInput';
import { useFormValidation } from '../hooks/useFormValidation';
import { required, email, minLength } from '../utils/validators';

const emptyForm = { name: '', email: '', password: '', role: 'user' };

const optionalPasswordRule = (message) => (value) => {
  if (!value || !String(value).trim()) return '';
  return String(value).length >= 6 ? '' : message;
};

const UserForm = ({ editingId, initialValues, onSubmit, onCancel, inModal = false }) => {
  const [submitting, setSubmitting] = useState(false);

  const validators = useMemo(
    () => ({
      name: [required('Name is required')],
      email: [required('Email is required'), email()],
      password: editingId
        ? [optionalPasswordRule('Password must be at least 6 characters')]
        : [
            required('Password is required'),
            minLength(6, 'Password must be at least 6 characters'),
          ],
      role: [required('Role is required')],
    }),
    [editingId]
  );

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
  } = useFormValidation(initialValues || emptyForm, validators);

  const onFormSubmit = handleSubmit(async (formValues) => {
    setSubmitting(true);
    try {
      await onSubmit(formValues);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      className={`user-form ${inModal ? 'user-form--modal' : 'card create-user-form'}`}
      onSubmit={onFormSubmit}
      noValidate
    >
      {!inModal && (
        <>
          <h3>{editingId ? 'Edit User' : 'Create New User'}</h3>
          <p className="form-subtitle">
            {editingId
              ? 'Update user details below'
              : 'Add a new user account with name, email, password, and role'}
          </p>
        </>
      )}
      <div className="form-row">
        <FormField label="Name" name="name" error={getFieldError('name')} required>
          <input
            id="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="Full name"
          />
        </FormField>
        <FormField label="Email" name="email" error={getFieldError('email')} required>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="user@email.com"
          />
        </FormField>
      </div>
      <div className="form-row">
        <FormField
          label={editingId ? 'Password (leave blank to keep)' : 'Password'}
          name="password"
          error={getFieldError('password')}
          required={!editingId}
        >
          <PasswordInput
            id="password"
            name="password"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder={editingId ? 'Optional' : 'Min 6 characters'}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Role" name="role" error={getFieldError('role')} required>
          <select
            id="role"
            value={values.role}
            onChange={(e) => handleChange('role', e.target.value)}
            onBlur={() => handleBlur('role')}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
        </button>
        <button type="button" className="btn btn-outline-dark" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UserForm;
