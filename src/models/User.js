const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  referralCode: { type: String, default: "" },
  isSubscribed: { type: Boolean, default: false },
  currentView: { type: String, default: "home" },
  selectedSubject: { type: String, default: null },
  selectedYear: { type: String, default: null },
  randomSubject: { type: String, default: "" },
  randomYear: { type: String, default: "" },
  randomQuestion: { type: Object, default: null },
  userAnswer: { type: String, default: "" },
  result: { type: String, default: null },
  pastQuestionsState: {
    questions: { type: Array, default: [] },
    userAnswers: { type: Object, default: {} },
    results: { type: String, default: null },
  },
  randomAttempts: { type: Number, default: 0 },
  lastResetDate: { type: Date, default: null },
  score: { type: Number, default: 0 }, // Assumed for leaderboard
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);