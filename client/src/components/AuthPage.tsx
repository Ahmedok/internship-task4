import { useState } from 'react';
import type { AxiosError } from 'axios';
import api from '../api';

interface FormData {
    name: string;
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
    };
}

interface ErrorResponse {
    message: string;
}

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const { data } = await api.post<AuthResponse>(endpoint, formData);

            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userId', String(data.user.id));

            window.location.href = '/';
        } catch (err) {
            console.error('REQUEST ERROR:', err);
            const axiosError = err as AxiosError<ErrorResponse>;
            setError(axiosError.response?.data.message || 'Something went wrong');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow p-4" style={{ width: '400px' }}>
                <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={(e) => void handleSubmit(e)}>
                    {!isLogin && (
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                required
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                }}
                            />
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            required
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                            }}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            required
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                            }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => {
                            setIsLogin(!isLogin);
                        }}
                    >
                        {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
