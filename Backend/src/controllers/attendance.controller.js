const attendanceModel = require('../models/attendance.model');
const learnerModel = require('../models/learner.model');

async function getMyAttendance(req, res) {
    const learner = await learnerModel.findOne({ user: req.user.id });
    if (!learner) {
        return res.status(404).json({ message: 'Learner profile not found' });
    }

    const records = await attendanceModel
        .find({ learner: learner._id })
        .sort({ sessionDate: -1 });

    const totalSessions = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const attendancePercent = totalSessions > 0
        ? Number(((presentCount / totalSessions) * 100).toFixed(1))
        : 0;

    return res.status(200).json({
        attendancePercent,
        totalSessions,
        presentCount,
        records
    });
}

module.exports = { getMyAttendance };