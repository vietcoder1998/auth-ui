import { useParams } from 'react-router';
import { Suspense } from 'react';
import Login from '../components/Login.tsx';
import Register from '../components/Register.tsx';
import SSOLogin from '../components/SSOLogin.tsx';
import SSOLoginSuccess from '../components/SSOLoginSuccess.tsx';
import LoginSuccess from '../components/LoginSuccess.tsx';
import ResetPassword from '../components/ResetPassword.tsx';
import ForgotPassword from '../components/ForgotPassword.tsx';
import TokenValidationPage from '../components/TokenValidationPage.tsx';
import NotFound from '../../components/NotFound.tsx';
import { Spin } from 'antd';

// Route mapping for auth pages
const authPageMap: Record<string, React.ComponentType> = {
  login: Login,
  register: Register,
  'sso-login': SSOLogin,
  'sso-login-success': SSOLoginSuccess,
  'login-success': LoginSuccess,
  'forgot-password': ForgotPassword,
  'reset-password': ResetPassword,
  'token-validation': TokenValidationPage,
};

/**
 * Dynamic Auth Page Component
 *
 * Routes:
 * - /auth/login -> Login
 * - /auth/register -> Register
 * - /auth/sso-login -> SSOLogin
 * - /auth/sso-login-success -> SSOLoginSuccess
 * - /auth/login-success -> LoginSuccess
 * - /auth/forgot-password -> ForgotPassword
 * - /auth/reset-password -> ResetPassword
 * - /auth/token-validation -> TokenValidationPage
 */
export default function AuthDynamicPage() {
  const { name } = useParams<{ name: string }>();

  // Get the component based on the route name
  const PageComponent = name ? authPageMap[name] : null;

  // If page not found, show NotFound component
  if (!PageComponent) {
    return <NotFound />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" tip="Loading..." />
        </div>
      }
    >
      <PageComponent />
    </Suspense>
  );
}
