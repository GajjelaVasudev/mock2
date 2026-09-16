// This file used to define its own mongoose.model('User', ...) schema.
// Mongoose lowercases + pluralizes model names when choosing a collection,
// so 'User' and 'user' both mapped to the same `users` collection as
// models/user.model.js — two different schemas silently sharing one
// collection. Both schemas have been merged into user.model.js; this file
// now just re-exports it so existing `require('../models/User')` imports
// (trainer/admin/employer code) keep working unchanged.
module.exports = require('./user.model');