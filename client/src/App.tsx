import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

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
