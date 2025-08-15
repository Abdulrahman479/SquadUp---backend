const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  sport: { type: String, required: true },
  playersNeeded: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  locationLink: { type: String },
  hostName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  perHeadCost: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  playersJoined: [
    {
      name: String,
      number: String,
      age: Number,
      position: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    }
  ],
  hostUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledAt: { type: Date }
});


module.exports = mongoose.model('Game', gameSchema);
