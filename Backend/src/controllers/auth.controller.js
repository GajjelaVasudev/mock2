const userModel = require('../models/user.model');
const learnerModel = require('../models/learner.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {
    const { username, email, password, role } = req.body;

    const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
        role
    });

    if (role === 'student') {
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
    const { email, password, username } = req.body;

    const user = await userModel.findOne({ $or: [{ username }, { email }] });
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