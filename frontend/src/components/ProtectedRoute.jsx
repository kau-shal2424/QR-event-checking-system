import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * ProtectedRoute component
 * Wraps routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
    const token = authService.getToken();

    if (!token) {
        // Redirect to login page if no token is found
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
