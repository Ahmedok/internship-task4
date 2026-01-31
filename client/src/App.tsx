import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './components/AuthPage.tsx';
import UserTable from './components/UserTable.tsx';
import { ToastContainer, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotFoundPage from './components/NotFoundPage.tsx';

const DisabledTransition = cssTransition({
    enter: 'noop',
    exit: 'noop',
    appendPosition: false,
    collapse: false,
    collapseDuration: 0,
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = !!localStorage.getItem('token');
    const location = useLocation();

    if (!isAuthenticated) {
        // Preserve params when redirecting to login
        return <Navigate to={`/login${location.search}`} replace />;
    }

    return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = !!localStorage.getItem('token');

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <BrowserRouter>
            <ToastContainer
                position="top-right"
                transition={DisabledTransition}
                autoClose={5000}
                newestOnTop={true}
                hideProgressBar={true}
                pauseOnFocusLoss={false}
                pauseOnHover={false}
                closeOnClick
                theme="colored"
                draggable={false}
            />

            <Routes>
                <Route
                    path="/login"
                    element={
                        <AuthRoute>
                            <AuthPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <UserTable />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
