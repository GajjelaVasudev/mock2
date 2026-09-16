const mongoose = require('mongoose');

// NOTE: this file used to coexist with models/User.js, which called
// mongoose.model('User', ...) with a *different* schema. Mongoose
// lowercases + pluralizes model names when picking a collection, so 'user'
// and 'User' both mapped to the same `users` collection — two incompatible
// schemas silently sharing one collection. A document created by
// auth.controller.js (this schema) was missing fields that trainer/admin/
// employer code expected (e.g. `name`, `phone`, `softSkillsProfile`), and
// vice versa. This schema is now the single source of truth for the
// `users` collection; models/User.js just re-exports it.
const UserSchema = new mongoose.Schema({
    // --- core auth fields (student/alumni/auth scope) ---
    username: {
        type: String,
        required: true,
        trim: true
    },
    // mirrors `username` — trainer/admin/employer code reads `user.name`
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    // mirrors `phoneNumber` — trainer/admin/employer code reads `user.phone`
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        default: 'student',
        enum: ['student', 'trainer', 'admin', 'employer', 'alumni']
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // --- fields used by trainer/admin/employer dashboards (merged from the
    // old User.js schema) ---
    center: {
        type: String,
        trim: true
    },
    batch: {
        type: String,
        trim: true
    },
    preferredLanguage: {
        type: String,
        enum: ['hi', 'en'],
        default: 'en'
    },
    organization: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    softSkillsProfile: {
        confidenceScore: { type: Number, default: 0 },
        communicationScore: { type: Number, default: 0 },
        workplaceEtiquetteScore: { type: Number, default: 0 },
        interviewReadinessScore: { type: Number, default: 0 },
        badgesEarned: { type: [String], default: [] },
        attendanceRate: { type: Number, default: 0 },
        mockInterviewsCompleted: { type: Number, default: 0 },
        trainerNotes: { type: String, default: '' }
    }
}, { timestamps: true });

// sparse so multiple users without an email/phone don't collide on `null`
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('user', UserSchema);