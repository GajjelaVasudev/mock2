const express = require('express');
const cookieParser = require('cookie-parser');


const app = express();
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const contentRoutes = require('./routes/content.routes');


app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/learners', studentRoutes);
app.use('/api/content', contentRoutes);


module.exports = app;