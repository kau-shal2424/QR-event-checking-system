const { Admin } = require('../models');
const { generateToken } = require('../utils/jwt');

/**
 * Register new admin
 * POST /auth/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input - 400 invalid input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Please provide name, email, and password'
            });
        }

        // Check if admin already exists - 409 already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        // Create admin - bcrypt hashing is handled in the model pre-save hook
        const admin = await Admin.create({
            name,
            email,
            password
        });

        // 201 created - Return success message and admin id
        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            adminId: admin._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering admin',
            error: error.message
        });
    }
};

/**
 * Login admin
 * POST /auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Please provide email and password'
            });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email });
        // 401 invalid credentials for both email/user not found or password mismatch
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token using secret from process.env.JWT_SECRET (handled in utility)
        const token = generateToken(admin._id, admin.role);

        // 200 success - Return token and admin data
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login
};
