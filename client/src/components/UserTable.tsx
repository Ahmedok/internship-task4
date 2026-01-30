import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { AxiosError } from 'axios';
import api from '../api';
import { FaTrash, FaLock, FaUnlock, FaSignOutAlt } from 'react-icons/fa';

// Logout logic
const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
};

interface User {
    id: number;
    name: string;
    email: string;
    lastLogin: string;
    registrationTime: string;
    status: 'ACTIVE' | 'BLOCKED';
}

interface ErrorResponse {
    message: string;
}

export default function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [refreshKey, setRefreshKey] = useState<number>(0);

    const currentUserName = localStorage.getItem('userName');

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const { data } = await api.get<User[]>('/users');
                setUsers(data);
            } catch (error) {
                console.error(error);
                const err = error as AxiosError;
                if (err.response?.status === 401 || err.response?.status === 403) {
                    logout();
                }
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
            setSelectedIds(selectedIds.filter((prevId) => prevId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Actions (Block / Unblock / Delete)
    const handleAction = async (action: 'block' | 'unblock' | 'delete'): Promise<void> => {
        if (selectedIds.length === 0) return;

        try {
            if (action === 'delete') {
                await api.delete('/users/delete', { data: { userIds: selectedIds } });
            } else {
                await api.post(`/users/${action}`, { userIds: selectedIds });
            }

            setRefreshKey((prev) => prev + 1);
            setSelectedIds([]);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            console.error(`Failed to ${action} users:`, axiosError.response?.data.message);
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                logout();
            }
        }
    };

    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Hello, {currentUserName}!</h2>
                <button className="btn btn-link text-danger" onClick={logout}>
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            {/* Toolbar */}
            <div className="btn-toolbar mb-3 gap-2">
                <button className="btn btn-danger" onClick={() => void handleAction('block')}>
                    <FaLock /> Block
                </button>
                <button className="btn btn-success" onClick={() => void handleAction('unblock')}>
                    <FaUnlock /> Unblock
                </button>
                <button className="btn btn-secondary" onClick={() => void handleAction('delete')}>
                    <FaTrash /> Delete
                </button>
            </div>

            {/* Table */}
            <div className="table-responsive shadow-sm bg-white rounded">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th scope="col" style={{ width: '50px' }}>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    onChange={toggleSelectAll}
                                    checked={
                                        users.length > 0 && selectedIds.length === users.length
                                    }
                                />
                            </th>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Status</th>
                            <th scope="col">Last Login</th>
                            <th scope="col">Registered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className={user.status === 'BLOCKED' ? 'table-danger' : ''}
                            >
                                <td>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedIds.includes(user.id)}
                                        onChange={() => {
                                            toggleSelect(user.id);
                                        }}
                                    />
                                </td>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span
                                        className={`badge ${user.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                {/* Date formatting */}
                                <td>{new Date(user.lastLogin).toLocaleString()}</td>
                                <td>{new Date(user.registrationTime).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
