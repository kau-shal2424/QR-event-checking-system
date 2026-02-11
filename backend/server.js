const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const participantRoutes = require('./routes/participantRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/participants', participantRoutes);
app.use('/stats', statsRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('QR Check-In Backend Running 🚀');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
