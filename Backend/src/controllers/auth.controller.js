const userModel = require('../models/user.model');
const learnerModel = require('../models/learner.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Roles the frontend may send that map onto our schema's enum
const ROLE_ALIASES = {
    learner: 'student'
};

function normalizeRole(role) {
    if (!role) return 'student';
    return ROLE_ALIASES[role] || role;
}

async function registerUser(req, res) {
    // Accept both the current schema's field names and the frontend's actual
    // payload shape (name/phone instead of username, "learner" instead of "student")
    const { username, name, email, phone, password, role } = req.body;
    const resolvedUsername = username || name;
    const resolvedRole = normalizeRole(role);

    if (!resolvedUsername || !password) {
        return res.status(400).json({ message: 'Name/username and password are required' });
    }

    const existingUser = await userModel.findOne({
        $or: [
            ...(resolvedUsername ? [{ username: resolvedUsername }] : []),
            ...(email ? [{ email }] : [])
        ]
    });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username: resolvedUsername,
        email,
        phoneNumber: phone,
        password: hashedPassword,
        role: resolvedRole
    });

    if (resolvedRole === 'student') {
        await learnerModel.create({ user: user._id });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET
    );

    res.cookie('token', token, { httpOnly: true });

    res.status(201).json({ message: 'User registered successfully', user });
}

async function LoginUser(req, res) {
    // Accept the current schema's field names, plus the frontend's actual
    // payload shape (a single "identifier" that could be a username or email)
    const { email, password, username, identifier } = req.body;

    if (!password || (!email && !username && !identifier)) {
        return res.status(400).json({ message: 'Email/username and password are required' });
    }

    const user = await userModel.findOne({
        $or: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : []),
            ...(identifier ? [{ username: identifier }, { email: identifier }] : [])
        ]
    });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET
    );

    res.cookie('token', token, { httpOnly: true });

    res.status(200).json({ message: 'User logged in successfully', user });
}

async function logoutUser(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'User logged out successfully' });
}

async function getMe(req, res) {
    const user = await userModel.findById(req.user.id).select('-password');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
}

module.exports = {
    registerUser,
    LoginUser,
    logoutUser,
    getMe
};