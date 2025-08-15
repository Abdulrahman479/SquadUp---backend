const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware

// Host a new game
router.post('/host', authMiddleware, async (req, res) => {
  try {
    const { date, time } = req.body;

    // Combine date and time into a single Date object
    const scheduledAt = new Date(`${date} ${time}`);

    const game = new Game({
      ...req.body,
      scheduledAt,
      hostUserId: req.user.id  // ✅ Corrected
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all games (optional filter for future games)
router.get('/', async (req, res) => {
  try {
    const games = await Game.find(); // shows all games
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register player for a game (prevent duplicate joins)
router.post('/register', authMiddleware, async (req, res) => {
  const { gameId, name, number, age, position } = req.body;
  const userId = req.user.id;  // ✅ Corrected

  if (!gameId || !name || !number || !age) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Prevent duplicate joins
    const alreadyJoined = game.playersJoined.some(player => player.userId.toString() === userId.toString());
    if (alreadyJoined) {
      return res.status(400).json({ message: 'You have already joined this game' });
    }

    if (game.playersJoined.length >= game.playersNeeded) {
      return res.status(400).json({ message: 'Game is full' });
    }

    game.playersJoined.push({ name, number, age, position, userId });
    await game.save();

    res.status(200).json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get games hosted by the logged-in user
router.get('/hosted', authMiddleware, async (req, res) => {
  try {
    const games = await Game.find({ hostUserId: req.user.id }); // ✅ Corrected
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hosted games' });
  }
});

// Get games joined by the logged-in user
router.get('/joined', authMiddleware, async (req, res) => {
  try {
    const games = await Game.find({ 'playersJoined.userId': req.user.id }); // ✅ Corrected
    const joinedGames = games.map(game => ({
      ...game._doc,
      joinedPlayer: game.playersJoined.find(p => p.userId.toString() === req.user.id)
    }));

    res.json(joinedGames);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch joined games' });
  }
});

module.exports = router;
