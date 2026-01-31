import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { AxiosError } from 'axios';
import api from '../api';
import {
    FaTrash,
    FaLock,
    FaUnlock,
    FaSignOutAlt,
    FaUserTimes,
    FaSyncAlt,
    FaBug,
} from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';
import { toast } from 'react-toastify';

interface User {
    id: number;
    name: string;
    email: string;
    lastLogin: string;
    registrationTime: string;
    status: 'ACTIVE' | 'BLOCKED' | 'UNVERIFIED';
}

interface ErrorResponse {
    message: string;
}

interface ActionResponse {
    message: string;
    count?: number;
}

// Logout logic
const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
};

export default function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshKey, setRefreshKey] = useState<number>(0);

    const currentUserName = localStorage.getItem('userName');

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const { data } = await api.get<User[]>('/users');
                setUsers(data);
            } catch (error) {
                console.error(error);
                const err = error as AxiosError<ErrorResponse>;
                if (err.response?.status === 401 || err.response?.status === 403) {
                    logout();
                } else {
                    const errorMessage = err.response?.data
                        ? err.response.data.message
                        : 'Failed to load users';
                    toast.error(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };
        void loadUsers();
    }, [refreshKey]);

    // Checkbox logic
    const toggleSelectAll = (e: ChangeEvent<HTMLInputElement>): void => {
        if (e.target.checked) {
            setSelectedIds(users.map((u) => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (id: number): void => {
        if (selectedIds.includes(id)) {
            setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
        } else {
            setSelectedIds((prev) => [...prev, id]);
        }
    };

    // Actions (Block / Unblock / Delete / Delete unverified)
    const handleAction = async (action: 'block' | 'unblock' | 'delete' | 'delete-unverified') => {
        if (action !== 'delete-unverified' && selectedIds.length === 0) {
            toast.warning('Please select at least one user');
            return;
        }

        // Confirmation for destructive actions (decided to keep here but disabled to adhere to the task requirements)
        // if (action === 'delete') {
        //     const confirmed = window.confirm(
        //         `Are you sure you want to delete ${String(selectedIds.length)} user(s)? This action cannot be undone.`,
        //     );
        //     if (!confirmed) return;
        // } else if (action === 'delete-unverified') {
        //     const confirmed = window.confirm(
        //         'Are you sure you want to delete ALL unverified users? This action cannot be undone.',
        //     );
        //     if (!confirmed) return;
        // }

        try {
            let message = '';

            if (action === 'delete') {
                // Delete chosen
                await api.delete('/users/delete', { data: { userIds: selectedIds } });
                message = `Deleted ${selectedIds.length.toString()} users`;
            } else if (action === 'delete-unverified') {
                // Delete all unverified
                const { data } = await api.delete<ActionResponse>('/users/delete-unverified');
                message = data.message || 'Unverified users cleaned';
            } else {
                await api.post(`/users/${action}`, { userIds: selectedIds });
                message = `Users ${action}ed successfully`;
            }

            setRefreshKey((prev) => prev + 1);
            setSelectedIds([]);

            toast.success(message);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;

            const errorMsg =
                axiosError.response?.data.message || axiosError.message || 'Operation failed';

            console.error(`Failed to ${action} users:`, axiosError.response?.data.message);

            if (axiosError.response?.status !== 401 && axiosError.response?.status !== 403) {
                toast.error(errorMsg);
            }

            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                logout();
            }
        }
    };

    const getStatusBadge = (status: User['status']) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-success';
            case 'BLOCKED':
                return 'bg-danger';
            case 'UNVERIFIED':
                return 'bg-warning text-dark';
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            <nav
                className="navbar navbar-expand-lg navbar-dark mb-4"
                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
            >
                <div className="container">
                    <span className="navbar-brand fw-bold fs-4">
                        <FaShield /> AdminPanel{' '}
                        <span className="fs-6 opacity-75 font-monospace">v1.0</span>
                    </span>
                    <div className="d-flex align-items-center text-white gap-3">
                        <div className="d-none d-sm-block text-end">
                            <div className="fw-bold small">{currentUserName || 'User'}</div>
                            <div className="small opacity-75" style={{ fontSize: '0.75rem' }}>
                                Administrator (just like everyone)
                            </div>
                        </div>
                        <button
                            className="btn btn-light btn-sm text-primary fw-bold shadow-sm"
                            onClick={logout}
                        >
                            <FaSignOutAlt className="me-1" /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container flex-grow-1">
                {/* Toolbar */}
                <div className="card shadow-sm border-0 mb-4 rounded-3">
                    <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                        {/* Action group */}
                        <div
                            className="btn-group shadow-sm"
                            role="group"
                            aria-label="User actions (left)"
                        >
                            <button
                                className="btn btn-danger"
                                onClick={() => void handleAction('block')}
                                disabled={loading || selectedIds.length === 0}
                                title="Block selected users"
                                aria-label="Block selected users"
                            >
                                <FaLock className="me-2" />{' '}
                                <span className="d-none d-sm-inline">Block</span>
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => void handleAction('unblock')}
                                disabled={loading || selectedIds.length === 0}
                                title="Unblock selected users"
                                aria-label="Unblock selected users"
                            >
                                <FaUnlock className="me-2" />{' '}
                                <span className="d-none d-sm-inline">Unblock</span>
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => void handleAction('delete')}
                                disabled={loading || selectedIds.length === 0}
                                title="Delete selected users"
                                aria-label="Delete selected users"
                            >
                                <FaTrash className="me-2" />{' '}
                                <span className="d-none d-sm-inline">Delete</span>
                            </button>
                        </div>

                        {/* Toolbar right */}
                        <div
                            className="btn-group d-flex gap-2"
                            role="group"
                            aria-label="User actions (right)"
                        >
                            {/* Remove unverified */}
                            <button
                                className="btn btn-outline-warning text-dark border-warning"
                                onClick={() => void handleAction('delete-unverified')}
                                disabled={loading}
                                title="Remove all unverified users"
                                aria-label="Remove all unverified users"
                            >
                                <FaUserTimes className="me-2" />{' '}
                                <span className="d-none d-md-inline fw-bold">
                                    Remove Unverified
                                </span>
                            </button>

                            {/* Refresh */}
                            <button
                                className="btn btn-light border"
                                onClick={() => {
                                    setRefreshKey((k) => k + 1);
                                }}
                                disabled={loading}
                                title="Refresh table"
                                aria-label="Refresh user list"
                            >
                                <FaSyncAlt
                                    className={
                                        loading
                                            ? 'text-muted'
                                            : refreshKey > 0
                                              ? 'text-primary'
                                              : 'text-muted'
                                    }
                                />
                            </button>
                        </div>
                    </div>
                    {/* Selection statistics */}
                    <div className="card-footer bg-white border-top-0 pt-0 pb-3">
                        <small className="text-muted">
                            Selected:{' '}
                            <span className="fw-bold text-dark">{selectedIds.length}</span> / Total:{' '}
                            <span className="fw-bold text-dark">{users.length}</span>
                        </small>
                    </div>
                </div>

                {/* User table (Responsive) */}
                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead
                                className="table-light text-secondary text-uppercase small"
                                style={{ letterSpacing: '0.5px' }}
                            >
                                <tr className="align-items-middle">
                                    <th scope="col" className="ps-4" style={{ width: '50px' }}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input border-secondary"
                                            onChange={toggleSelectAll}
                                            checked={
                                                users.length > 0 &&
                                                selectedIds.length === users.length
                                            }
                                            disabled={loading}
                                            style={{ cursor: 'pointer' }}
                                            aria-label="Select all users"
                                        />
                                    </th>
                                    <th scope="col">ID</th>
                                    <th scope="col">User Info</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Last Login</th>
                                    <th scope="col" className="text-nowrap pe-4">
                                        Registered
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`align-items-middle ${user.status === 'BLOCKED' ? 'table-danger' : ''}`}
                                    >
                                        <td className="ps-4">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={selectedIds.includes(user.id)}
                                                onChange={() => {
                                                    toggleSelect(user.id);
                                                }}
                                                disabled={loading}
                                                style={{ cursor: 'pointer' }}
                                                aria-label={`Select user ${user.name}`}
                                            />
                                        </td>
                                        <td className="text-muted fw-light">
                                            <span>#{user.id}</span>
                                        </td>

                                        {/* Name + Mail */}
                                        <td>
                                            <div className="fw-bold text-dark">{user.name}</div>
                                            <div className="small text-muted">{user.email}</div>
                                        </td>

                                        <td>
                                            <span
                                                className={`badge rounded-pill ${getStatusBadge(user.status)} shadow-sm`}
                                                style={{ minWidth: '80px' }}
                                            >
                                                {user.status}
                                            </span>
                                        </td>

                                        <td className="text-muted small">
                                            {user.lastLogin
                                                ? new Date(user.lastLogin).toLocaleString()
                                                : 'Never'}
                                        </td>
                                        <td className="text-muted small pe-4 text-nowrap">
                                            {new Date(user.registrationTime).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}

                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-5 text-muted bg-light"
                                        >
                                            <div
                                                className="spinner-border text-primary mb-3"
                                                role="status"
                                            >
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <div>Loading users...</div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-5 text-muted bg-light"
                                        >
                                            <div className="fs-1 mb-3">
                                                <FaBug />
                                            </div>
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-center mt-4 mb-5 text-muted small opacity-50">
                    Developed by Ahmedok (Assylzhan Sarinov) • {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
}
