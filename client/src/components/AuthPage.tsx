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
            <div
                className="card shadow-lg border-0 rounded-4"
                style={{ width: '400px', maxWidth: '90%' }}
            >
                <div className="card-body p-5">
                    <h2 className="text-center mb-4 fw-bold text-primary">
                        {isLogin ? 'Welcome Back' : 'Register'}
                    </h2>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <form onSubmit={(e) => void handleSubmit(e)}>
                        {!isLogin && (
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                    }}
                                />
                                <label htmlFor="floatingName">Full Name</label>
                            </div>
                        )}
                        <div className="form-floating mb-3">
                            <input
                                type="email"
                                className="form-control"
                                required
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                }}
                            />
                            <label htmlFor="floatingEmail">Email address</label>
                        </div>
                        <div className="form-floating mb-4">
                            <input
                                type="password"
                                className="form-control"
                                required
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                }}
                            />
                            <label htmlFor="floatingPassword">Password</label>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 btn-lg rounded-3">
                            {isLogin ? 'Login' : 'Register'}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <span className="text-muted small">
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        </span>
                        <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none fw-bold"
                            onClick={() => {
                                setIsLogin(!isLogin);
                            }}
                        >
                            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
