const moduleModel = require('../models/module.model');

async function getModules(req, res) {
    const modules = await moduleModel
        .find({ isActive: true })
        .sort({ skillCategory: 1, order: 1 })
        .select('title description skillCategory contentType language order');

    return res.status(200).json({ modules });
}

async function getModuleById(req, res) {
    const module = await moduleModel.findById(req.params.id);

    if (!module || !module.isActive) {
        return res.status(404).json({ message: 'Module not found' });
    }

    return res.status(200).json({ module });
}

module.exports = { getModules, getModuleById };