require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db/db');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 ETASHA SkillSetu Backend running on http://localhost:${PORT}`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Auth Endpoints: http://localhost:${PORT}/api/auth/login & register`);
});

// Connect to DB asynchronously without blocking server
connectDB();

module.exports = server;