import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../api/authApi';
import { getErrorMessage } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import { InContentAd1, InContentAd2 } from '../components/ads/AdPlacements';
import { useFormValidation } from '../hooks/useFormValidation';
import { required, email } from '../utils/validators';
import { isUserAdmin } from '../utils/authHelpers';

const loginValidators = {
  email: [required('Email is required'), email()],
  password: [required('Password is required')],
};

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { loginUser, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
  } = useFormValidation({ email: '', password: '' }, loginValidators);

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = isUserAdmin(user) ? '/admin/dashboard' : '/user/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = handleSubmit(async (formValues) => {
    setLoading(true);
    try {
      const res = await login(formValues);
      const { token, user: loggedInUser } = res.data.data;
      if (!token) {
        toast.error('Login failed: invalid token received from server.');
        return;
      }
      const loggedIn = loginUser(token, loggedInUser);
      if (!loggedIn) {
        toast.error('Login failed: could not save session.');
        return;
      }
      toast.success('Login successful!');
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
          <h2>Login</h2>
          <FormField label="Email" name="email" error={getFieldError('email')} required>
            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email"
            />
          </FormField>
          <FormField label="Password" name="password" error={getFieldError('password')} required>
            <PasswordInput
              id="password"
              name="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="auth-link">
            Don&apos;t have an account? <Link to="/register">Register</Link>
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

export default LoginPage;
