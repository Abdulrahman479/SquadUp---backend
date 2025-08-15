require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const moment = require('moment');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/health', (req, res)=>{
  res.send("Healthy")
})

// Routes
const gameRoutes = require('./routes/games');
const authRoutes = require('./routes/auth');
app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);

app.use('/', (req, res)=>{
  res.send("Hello User")
})

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Cron Job to Delete Expired Games
const Game = require('./models/Game');
cron.schedule('*/10 * * * *', async () => {
  try {
    const now = moment();

    const games = await Game.find();
    for (const game of games) {
      const gameDateTime = moment(`${game.date} ${game.time}`, 'YYYY-MM-DD hh:mm A');
      if (gameDateTime.isBefore(now)) {
        await Game.findByIdAndDelete(game._id);
        console.log(`🗑️ Deleted expired game: ${game._id}`);
      }
    }
  } catch (err) {
    console.error('❌ Error deleting expired games:', err.message);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
