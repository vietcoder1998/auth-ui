import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../apis/auth.api.ts';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await login({ username: email, password });
            // Save token to localStorage or context
            localStorage.setItem('token', res.token);
            // Redirect to url param if exists
            const redirect = searchParams.get('redirect');
            navigate(redirect || '/');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="border rounded px-3 py-2 w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border rounded px-3 py-2 w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <div className="text-red-500">{error}</div>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className="mt-4 text-center">
                <a href="/register" className="text-blue-600 hover:underline">Register</a> |{' '}
                <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
            </div>
        </div>
    );
};

export default Login;
