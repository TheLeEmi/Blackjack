// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  balance: { type: Number, default: 1000 },
  status: { type: String, default: 'activ' },
  wins: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  correctCounts: { type: Number, default: 0 },
  totalCountAttempts: { type: Number, default: 0 },
  countAccuracy: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);