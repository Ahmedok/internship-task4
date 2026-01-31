import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage.tsx';
import UserTable from './components/UserTable.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotFoundPage from './components/NotFoundPage.tsx';

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <Routes>
                <Route
                    path="/login"
                    element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/"
                    element={isAuthenticated ? <UserTable /> : <Navigate to="/login" />}
                />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
