const mongoose = require('mongoose');

const LearnerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    center: {
        type: String,
        trim: true
    },
    cohort: {
        type: String,
        trim: true
    },
    placementStatus: {
        type: String,
        enum: ['in-training', 'seeking', 'placed'],
        default: 'in-training'
    },// Add these fields to the existing LearnerSchema in src/models/learner.model.js
isMentor: {
    type: Boolean,
    default: false
},
mentorBio: {
    type: String,
    trim: true
},
placedCompany: {
    type: String,
    trim: true
},
placedRole: {
    type: String,
    trim: true
},
placedDate: {
    type: Date
},
isAlumni: {
    type: Boolean,
    default: false
}
}, { timestamps: true });

module.exports = mongoose.model('learner', LearnerSchema);