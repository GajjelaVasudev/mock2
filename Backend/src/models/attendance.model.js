const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    learner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'learner',
        required: true
    },
    sessionDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // the trainer who marked it
    }
}, { timestamps: true });

module.exports = mongoose.model('attendance', AttendanceSchema);
