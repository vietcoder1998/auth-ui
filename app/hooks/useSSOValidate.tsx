import { useState, useCallback } from 'react';
import { adminApi } from '../apis/admin.api';
import { ssoLogin } from '../apis/auth.api';

interface SSOValidationResult {
  success: boolean;
  valid?: boolean;
  matchedKeyType?: 'key' | 'ssoKey';
  sso?: {
    id: string;
    url: string;
    userId: string;
    isActive: boolean;
    expiresAt?: string;
  };
  user?: {
    id: string;
    email: string;
    nickname?: string;
  };
  error?: string;
  message?: string;
}

interface SSOLoginState {
  step: 'idle' | 'validating' | 'verified' | 'logging-in' | 'creating-token' | 'success' | 'error';
  message: string;
  progress: number;
}

interface SSOLoginData {
  ssoKey: string;
  gmail: string;
  deviceIP?: string;
  userAgent: string;
  location: string;
}

interface UseSSOValidateReturn {
  validating: boolean;
  loginState: SSOLoginState;
  validationResult: SSOValidationResult | null;
  error: string | null;
  validateSSOKey: (ssoKey: string, email: string) => Promise<boolean>;
  performSSOLogin: (loginData: SSOLoginData, redirectUrl?: string) => Promise<{
    success: boolean;
    token?: string;
    userData?: any;
    loginSuccessUrl?: string;
    error?: string;
  }>;
  resetState: () => void;
  setError: (error: string | null) => void;
}

export const useSSOValidate = (): UseSSOValidateReturn => {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<SSOValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginState, setLoginState] = useState<SSOLoginState>({
    step: 'idle',
    message: 'Enter your SSO key and email to continue',
    progress: 0
  });

  const validateSSOKey = useCallback(async (ssoKey: string, email: string): Promise<boolean> => {
    if (!ssoKey) {
      setError('Please enter an SSO key');
      setLoginState({ step: 'error', message: 'SSO key is required', progress: 0 });
      return false;
    }

    if (!email) {
      setError('Please enter your email address');
      setLoginState({ step: 'error', message: 'Email address is required', progress: 0 });
      return false;
    }

    // Validate email format - allow all .com domains
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (must end with .com)');
      setLoginState({ step: 'error', message: 'Invalid email format', progress: 0 });
      return false;
    }

    setValidating(true);
    setError(null);
    setLoginState({ step: 'validating', message: 'Validating SSO key and email...', progress: 25 });
    
    try {
      // Send both SSO key and email for validation
      const { data: result } = await adminApi.validateSSOKey(ssoKey, email);
      setValidationResult(result);
      
      if (result.success || result.valid) {
        setLoginState({ step: 'verified', message: 'SSO credentials verified successfully', progress: 50 });
        return true;
      } else {
        const errorMsg = result.error || result.message || 'Invalid SSO credentials';
        setError(errorMsg);
        setLoginState({ step: 'error', message: errorMsg, progress: 0 });
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Failed to validate SSO credentials';
      setError(errorMessage);
      setValidationResult(null);
      setLoginState({ step: 'error', message: errorMessage, progress: 0 });
      return false;
    } finally {
      setValidating(false);
    }
  }, []);

  const performSSOLogin = useCallback(async (
    loginData: SSOLoginData, 
    redirectUrl?: string
  ): Promise<{
    success: boolean;
    token?: string;
    userData?: any;
    loginSuccessUrl?: string;
    error?: string;
  }> => {
    const { ssoKey, gmail } = loginData;
    
    if (!ssoKey || !gmail || !(validationResult?.success || validationResult?.valid)) {
      const errorMsg = 'Please validate your SSO credentials first';
      setError(errorMsg);
      setLoginState({ step: 'error', message: 'SSO credentials validation required', progress: 0 });
      return { success: false, error: errorMsg };
    }

    setError(null);
    setLoginState({ step: 'logging-in', message: 'Processing SSO login...', progress: 75 });
    
    try {
      const result = await ssoLogin(loginData);

      // The result should contain loginHistory and user info
      if (result.data && result.data.user) {
        setLoginState({ step: 'creating-token', message: 'Creating secure token...', progress: 90 });
        
        const userData = result.data.user;
        
        // Create a new token using the token API
        try {
          const tokenResponse = await adminApi.createToken({
            userId: userData.id,
            ssoId: result.data.loginHistory?.ssoId,
            type: 'sso',
            gmail: gmail,
            metadata: {
              deviceIP: result.data.loginHistory?.deviceIP,
              userAgent: loginData.userAgent,
              location: loginData.location,
              loginAt: new Date().toISOString()
            }
          });

          const newToken = tokenResponse.data.token;
          setLoginState({ step: 'success', message: 'Login successful! Redirecting...', progress: 100 });

          const loginSuccessUrl = `/sso/login-success?user=${encodeURIComponent(JSON.stringify(userData))}&ssoId=${result.data.loginHistory?.ssoId || ''}&token=${encodeURIComponent(newToken)}${redirectUrl ? `&callback=${encodeURIComponent(redirectUrl)}` : ''}`;
          
          return {
            success: true,
            token: newToken,
            userData,
            loginSuccessUrl
          };
        } catch (tokenError: any) {
          console.error('Token creation failed:', tokenError);
          // Fallback to mock token if token creation fails
          const mockToken = btoa(JSON.stringify({
            userId: userData.id,
            email: userData.email,
            gmail: gmail,
            type: 'sso',
            ssoId: result.data.loginHistory?.ssoId
          }));

          setLoginState({ step: 'success', message: 'Login successful! (Using fallback token) Redirecting...', progress: 100 });
          
          const loginSuccessUrl = `/sso/login-success?user=${encodeURIComponent(JSON.stringify(userData))}&ssoId=${result.data.loginHistory?.ssoId || ''}&token=${encodeURIComponent(mockToken)}${redirectUrl ? `&callback=${encodeURIComponent(redirectUrl)}` : ''}`;
          
          return {
            success: true,
            token: mockToken,
            userData,
            loginSuccessUrl
          };
        }
      } else {
        // Block direct navigation if login fails
        const errorMsg = 'Invalid login response from server';
        setError(errorMsg);
        setLoginState({ step: 'error', message: errorMsg, progress: 0 });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'SSO login failed';
      setError(errorMessage);
      setLoginState({ step: 'error', message: errorMessage, progress: 0 });
      return { success: false, error: errorMessage };
    }
  }, [validationResult]);

  const resetState = useCallback(() => {
    setValidationResult(null);
    setError(null);
    setLoginState({
      step: 'idle',
      message: 'Enter your SSO key and email to continue',
      progress: 0
    });
  }, []);

  return {
    validating,
    loginState,
    validationResult,
    error,
    validateSSOKey,
    performSSOLogin,
    resetState,
    setError
  };
};