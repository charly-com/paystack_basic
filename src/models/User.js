const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  referralCode: { type: String, default: '' },
  isSubscribed: { type: Boolean, default: false },
  currentView: { type: String, default: 'home' },
  selectedSubject: { type: String, default: null },
  selectedYear: { type: String, default: null },
  randomSubject: { type: String, default: '' },
  randomYear: { type: String, default: '' },
  randomQuestion: { type: Object, default: null },
  userAnswer: { type: String, default: '' },
  result: { type: String, default: null },
  pastQuestionsState: {
    questions: { type: Array, default: [] },
    userAnswers: { type: Object, default: {} },
    results: { type: Object, default: null },
  },
  randomAttempts: { type: Number, default: 0 },
  lastResetDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);