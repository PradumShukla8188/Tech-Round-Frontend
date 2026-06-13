import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../api/authApi';
import { getErrorMessage } from '../api/apiClient';
import Layout from '../components/Layout';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import { InContentAd1, InContentAd2 } from '../components/ads/AdPlacements';
import { useFormValidation } from '../hooks/useFormValidation';
import { required, email, minLength, matchField } from '../utils/validators';

const registerValidators = {
  name: [required('Name is required')],
  email: [required('Email is required'), email()],
  password: [
    required('Password is required'),
    minLength(6, 'Password must be at least 6 characters'),
  ],
  confirmPassword: [
    required('Confirm password is required'),
    matchField('password', 'Passwords do not match'),
  ],
};

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
  } = useFormValidation(
    { name: '', email: '', password: '', confirmPassword: '' },
    registerValidators
  );

  const onSubmit = handleSubmit(async (formValues) => {
    setLoading(true);
    try {
      await register(formValues);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  });

  return (
    <Layout showSidebar={false}>
      <div className="auth-page with-ads">
        <form className="auth-form card" onSubmit={onSubmit} noValidate>
          <h2>Register</h2>
          <FormField label="Name" name="name" error={getFieldError('name')} required>
            <input
              id="name"
              name="name"
              type="text"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Your name"
            />
          </FormField>
          <FormField label="Email" name="email" error={getFieldError('email')} required>
            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="Your email"
            />
          </FormField>
          <FormField label="Password" name="password" error={getFieldError('password')} required>
            <PasswordInput
              id="password"
              name="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
          </FormField>
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            error={getFieldError('confirmPassword')}
            required
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
        <div className="auth-ads">
          <InContentAd1 />
          <InContentAd2 />
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
