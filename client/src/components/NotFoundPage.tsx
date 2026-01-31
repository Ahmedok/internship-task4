import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

export default function NotFoundPage() {
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <div className="card shadow-lg border-0 p-5 rounded-4" style={{ maxWidth: '500px' }}>
        <div className="mb-4 text-warning">
          <FaExclamationTriangle size={64} />
        </div>
        
        <h1 className="display-1 fw-bold text-dark mb-0">404</h1>
        <h2 className="h4 text-secondary mb-4">Page Not Found</h2>
        
        <p className="text-muted mb-4">
          Oops! The page you are looking for does not exist or has been moved.
        </p>

        <Link to="/" className="btn btn-primary btn-lg rounded-3 px-4 d-inline-flex align-items-center gap-2">
           <FaHome /> Go Home
        </Link>
      </div>
    </div>
  );
}