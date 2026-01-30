import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage.tsx';
import UserTable from './components/UserTable.tsx';

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/"
                    element={isAuthenticated ? <UserTable /> : <Navigate to="/login" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
