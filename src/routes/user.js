const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create or update user

router.post("/", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    referralCode,
    isSubscribed,
    currentView,
    selectedSubject,
    selectedYear,
    randomSubject,
    randomYear,
    randomQuestion,
    userAnswer,
    result,
    pastQuestionsState,
    randomAttempts,
    lastResetDate,
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      // Update existing user with provided fields only
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (referralCode !== undefined) user.referralCode = referralCode;
      if (isSubscribed !== undefined) user.isSubscribed = isSubscribed;
      if (currentView !== undefined) user.currentView = currentView;
      if (selectedSubject !== undefined) user.selectedSubject = selectedSubject;
      if (selectedYear !== undefined) user.selectedYear = selectedYear;
      if (randomSubject !== undefined) user.randomSubject = randomSubject;
      if (randomYear !== undefined) user.randomYear = randomYear;
      if (randomQuestion !== undefined) user.randomQuestion = randomQuestion;
      if (userAnswer !== undefined) user.userAnswer = userAnswer;
      if (result !== undefined) user.result = result;
      if (pastQuestionsState !== undefined) user.pastQuestionsState = pastQuestionsState;
      if (randomAttempts !== undefined) user.randomAttempts = randomAttempts;
      if (lastResetDate !== undefined) user.lastResetDate = lastResetDate;
      user.updatedAt = Date.now();
      await user.save();
      return res.json({ message: "User updated", user });
    }

    // Create new user (requires firstName and lastName)
    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required for new users." });
    }

    user = new User({
      email,
      firstName,
      lastName,
      referralCode: referralCode || "",
      isSubscribed: isSubscribed || false,
      currentView: currentView || "home",
      selectedSubject: selectedSubject || null,
      selectedYear: selectedYear || null,
      randomSubject: randomSubject || "",
      randomYear: randomYear || "",
      randomQuestion: randomQuestion || null,
      userAnswer: userAnswer || "",
      result: result || null,
      pastQuestionsState: pastQuestionsState || {
        questions: [],
        userAnswers: {},
        results: null,
      },
      randomAttempts: randomAttempts || 0,
      lastResetDate: lastResetDate || null,
    });
    await user.save();
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    console.error("Error managing user:", error);
    res.status(500).json({ message: "Failed to manage user" });
  }
});

// Get user by email
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update subscription status (e.g., after Paystack payment)
router.put('/:email/subscription', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { isSubscribed: true, updatedAt: Date.now() },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Subscription updated', user });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

router.get('/leaderboards', async (req, res) => {
  try {
    const mockLeaderboard = [
      { firstName: "Segun", lastName: "Adebayo", score: 950 },
      { firstName: "Jane", lastName: "Okoro", score: 920 },
      { firstName: "Alex", lastName: "Johnson", score: 880 },
      { firstName: "Emily", lastName: "Obozele", score: 850 },
      { firstName: "Michael", lastName: "Davis", score: 820 },
      { firstName: "Sarah", lastName: "Wilson", score: 790 },
      { firstName: "David", lastName: "Taylor", score: 760 },
      { firstName: "Laura", lastName: "Martinez", score: 730 },
      { firstName: "Chris", lastName: "Anderson", score: 700 },
      { firstName: "Kelly", lastName: "Thomas", score: 680 },
    ];
    console.log('Returning mock leaderboard:', mockLeaderboard);
    return res.json(mockLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});
// router.get('/leaderboard', async (req, res) => {
//   try {
//     const topUsers = await User.find()
//       .sort({ score: -1 }) // Sort by score descending
//       .limit(10) // Top 10 users
//       .select('firstName lastName score'); // Return relevant fields
//     res.json(topUsers);
//   } catch (error) {
//     console.error('Error fetching leaderboard:', error);
//     res.status(500).json({ message: 'Failed to fetch leaderboard' });
//   }
// });

module.exports = router;