const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    skillCategory: {
        type: String,
        required: true,
        enum: ['communication', 'confidence', 'teamwork', 'interview-readiness', 'etiquette']
    },
    contentType: {
        type: String,
        enum: ['video', 'audio', 'text', 'scenario'],
        default: 'text'
    },
    contentUrl: {
        type: String,
        trim: true
    },
    contentBody: {
        type: String // used when contentType is 'text'
    },
    language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('module', ModuleSchema);