import api from './api';

/**
 * Register a new admin
 * @param {Object} data - Admin registration data (name, email, password)
 * @returns {Promise} - Axios promise
 */
export const registerAdmin = async (data) => {
    return await api.post('/auth/register', data);
};

/**
 * Login admin
 * @param {Object} data - Login credentials (email, password)
 * @returns {Promise} - Axios promise
 */
export const loginAdmin = async (data) => {
    return await api.post('/auth/login', data);
};

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token
 */
export const storeToken = (token) => {
    localStorage.setItem('token', token);
};

/**
 * Get JWT token from localStorage
 * @returns {string|null} - JWT token or null
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Clear token and admin data from localStorage
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
};

const authService = {
    registerAdmin,
    loginAdmin,
    storeToken,
    getToken,
    logout
};

export default authService;
