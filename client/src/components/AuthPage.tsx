import { useState, useEffect } from 'react';
import type { AxiosError } from 'axios';
import api from '../api';
import { toast } from 'react-toastify';
import { FaCube } from 'react-icons/fa';
import { Fa4 } from 'react-icons/fa6';

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
        email: string;
        status: string;
    };
    message?: string;
}

interface ErrorResponse {
    message: string;
}

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check sessionStorage for client messages (interceptor)
        const wasBlocked = sessionStorage.getItem('userBlocked');

        if (wasBlocked === 'true') {
            setTimeout(() => {
                toast.error(
                    'The account has been blocked or your session expired. Please login again.',
                );
            }, 100);
            sessionStorage.removeItem('userBlocked');
        }

        // Check URL parameters for backend messages (email verification)
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');

        if (status === 'verified') {
            setTimeout(() => {
                toast.success('Email verified successfully! You can now login.');
            }, 100);
            window.history.replaceState({}, '', '/login');
        } else if (status === 'invalid-token' || status === 'already-verified') {
            setTimeout(() => {
                const message =
                    status === 'invalid-token'
                        ? 'Verification link is invalid or has expired. Please request a new one.'
                        : 'This email is already verified. Please login.';
                toast.error(message);
            }, 100);
            window.history.replaceState({}, '', '/login');
        }
    }, []);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.warning('Please enter a valid email address');
            return;
        }

        // Password validation
        if (formData.password.length < 1) {
            toast.warning('Password is required');
            return;
        }

        if (!isLogin && formData.name.trim().length < 1) {
            toast.warning('Name is required');
            return;
        }

        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const { data } = await api.post<AuthResponse>(endpoint, formData);

            if (isLogin) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userId', String(data.user.id));

                toast.success(`Welcome back, ${data.user.name}!`);

                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.name);

                toast.info('Registration successful! Please check your email.');

                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            }
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            const message = error.response?.data.message || error.message || 'Something went wrong';

            toast.error(message);

            // Clear password on error for security
            setFormData((prev) => ({ ...prev, password: '' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div
                className="card shadow-sm border-0 rounded-3"
                style={{ width: '400px', maxWidth: '90%' }}
            >
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <div className="display-4 text-primary mb-2">
                            <FaCube />
                            <Fa4 />
                        </div>
                        <h1 className="h3 fw-bold text-dark">Task 4 App</h1>
                        <p className="text-muted small">User Database Management</p>
                    </div>

                    <h2 className="text-center mb-4 fw-bold text-primary">
                        {isLogin ? 'Welcome Back' : 'Register'}
                    </h2>

                    <form onSubmit={(e) => void handleSubmit(e)}>
                        {!isLogin && (
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="floatingName"
                                    placeholder="John Doe"
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
                                id="floatingEmail"
                                placeholder="john.doe@example.com"
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
                                id="floatingPassword"
                                placeholder="***"
                                required
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                }}
                            />
                            <label htmlFor="floatingPassword">Password</label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 btn-lg rounded-3"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    {isLogin ? 'Logging in...' : 'Registering...'}
                                </>
                            ) : isLogin ? (
                                'Login'
                            ) : (
                                'Register'
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4 d-flex flex-column justify-content-center align-items-center gap-1">
                        <span className="text-muted small">
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        </span>
                        <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none fw-bold"
                            onClick={() => {
                                setIsLogin(!isLogin);
                            }}
                            disabled={loading}
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
