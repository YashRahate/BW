const express = require('express');
const jwt = require('jsonwebtoken');
const { Volunteer } = require('../models'); // Adjust path as needed
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Get user's quiz stats and profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id).select('-password');
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Initialize quiz stats if they don't exist
    if (!volunteer.quizStats) {
      volunteer.quizStats = {
        totalPoints: 0,
        correctAnswers: 0,
        quizStreak: 0,
        completedLevels: [],
        badges: [],
        lastQuizDate: null,
        dailyChallengeCompleted: false,
        practiceQuizzesTaken: 0
      };
    }

    res.json({
      success: true,
      data: {
        user: {
          id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          rewardPoints: volunteer.rewardPoints,
          achievements: volunteer.achievements
        },
        quizStats: volunteer.quizStats
      }
    });
  } catch (error) {
    console.error('Error fetching quiz profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Update user's quiz stats
router.post('/update-stats', verifyToken, async (req, res) => {
  try {
    const { 
      pointsEarned, 
      correctAnswers, 
      gameMode, 
      levelCompleted, 
      percentage,
      newBadges = []
    } = req.body;

    const volunteer = await Volunteer.findById(req.user.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Initialize quiz stats if they don't exist
    if (!volunteer.quizStats) {
      volunteer.quizStats = {
        totalPoints: 0,
        correctAnswers: 0,
        quizStreak: 0,
        completedLevels: [],
        badges: [],
        lastQuizDate: null,
        dailyChallengeCompleted: false,
        practiceQuizzesTaken: 0
      };
    }

    // Update basic stats
    volunteer.quizStats.totalPoints += pointsEarned || 0;
    volunteer.quizStats.correctAnswers += correctAnswers || 0;

    // Update reward points in main volunteer schema
    volunteer.rewardPoints += pointsEarned || 0;

    // Handle level completion
    if (levelCompleted && percentage >= 80) {
      if (!volunteer.quizStats.completedLevels.includes(levelCompleted)) {
        volunteer.quizStats.completedLevels.push(levelCompleted);
      }
    }

    // Handle daily challenge completion
    const today = new Date().toDateString();
    const lastQuizDate = volunteer.quizStats.lastQuizDate ? 
      new Date(volunteer.quizStats.lastQuizDate).toDateString() : null;

    if (gameMode === 'daily') {
      volunteer.quizStats.dailyChallengeCompleted = true;
      
      // Update streak
      if (lastQuizDate === new Date(Date.now() - 86400000).toDateString()) {
        // Yesterday's date - continue streak
        volunteer.quizStats.quizStreak += 1;
      } else if (lastQuizDate !== today) {
        // New streak or broken streak
        volunteer.quizStats.quizStreak = 1;
      }
    } else if (gameMode === 'practice') {
      volunteer.quizStats.practiceQuizzesTaken += 1;
    }

    // Update last quiz date
    volunteer.quizStats.lastQuizDate = new Date();

    // Handle new badges
    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        if (!volunteer.quizStats.badges.includes(badge)) {
          volunteer.quizStats.badges.push(badge);
        }
        if (!volunteer.achievements.includes(badge)) {
          volunteer.achievements.push(badge);
        }
      });
    }

    // Auto-award badges based on achievements
    const autoAwardedBadges = [];
    
    if (percentage === 100 && !volunteer.quizStats.badges.includes('perfect_score')) {
      volunteer.quizStats.badges.push('perfect_score');
      volunteer.achievements.push('Perfect Score Achievement');
      autoAwardedBadges.push('perfect_score');
    }

    if (volunteer.quizStats.quizStreak >= 7 && !volunteer.quizStats.badges.includes('weekly_warrior')) {
      volunteer.quizStats.badges.push('weekly_warrior');
      volunteer.achievements.push('Weekly Warrior');
      autoAwardedBadges.push('weekly_warrior');
    }

    if (volunteer.quizStats.totalPoints >= 1000 && !volunteer.quizStats.badges.includes('point_master')) {
      volunteer.quizStats.badges.push('point_master');
      volunteer.achievements.push('Point Master');
      autoAwardedBadges.push('point_master');
    }

    await volunteer.save();

    res.json({
      success: true,
      message: 'Stats updated successfully',
      data: {
        quizStats: volunteer.quizStats,
        rewardPoints: volunteer.rewardPoints,
        autoAwardedBadges
      }
    });
  } catch (error) {
    console.error('Error updating quiz stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating stats'
    });
  }
});

// Get leaderboard for quiz points
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const volunteers = await Volunteer.find({})
      .select('name email quizStats rewardPoints')
      .lean();

    // Sort by quiz points in descending order
    const leaderboard = volunteers
      .map(volunteer => ({
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        quizPoints: volunteer.quizStats?.totalPoints || 0,
        totalRewardPoints: volunteer.rewardPoints || 0,
        badges: volunteer.quizStats?.badges?.length || 0,
        completedLevels: volunteer.quizStats?.completedLevels?.length || 0,
        quizStreak: volunteer.quizStats?.quizStreak || 0
      }))
      .sort((a, b) => b.quizPoints - a.quizPoints)
      .slice(0, 50); // Top 50 users

    // Add rank to each user
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard'
    });
  }
});

// Reset daily challenge status (can be called by a cron job)
router.post('/reset-daily-challenge', verifyToken, async (req, res) => {
  try {
    // Only allow admin users to reset daily challenges
    const volunteer = await Volunteer.findById(req.user.id);
    if (!volunteer || volunteer.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    await Volunteer.updateMany(
      {},
      { $set: { 'quizStats.dailyChallengeCompleted': false } }
    );

    res.json({
      success: true,
      message: 'Daily challenge status reset for all users'
    });
  } catch (error) {
    console.error('Error resetting daily challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting daily challenge'
    });
  }
});

// Get user's quiz history and detailed stats
router.get('/detailed-stats', verifyToken, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id).select('-password');
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Calculate additional stats
    const stats = volunteer.quizStats || {};
    const accuracy = stats.correctAnswers > 0 ? 
      ((stats.correctAnswers / (stats.correctAnswers + (stats.totalAttempts || 0))) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        basicStats: {
          totalPoints: stats.totalPoints || 0,
          correctAnswers: stats.correctAnswers || 0,
          quizStreak: stats.quizStreak || 0,
          completedLevels: stats.completedLevels || [],
          badges: stats.badges || [],
          practiceQuizzesTaken: stats.practiceQuizzesTaken || 0,
          accuracy: accuracy
        },
        achievements: volunteer.achievements || [],
        rewardPoints: volunteer.rewardPoints || 0,
        lastQuizDate: stats.lastQuizDate,
        dailyChallengeCompleted: stats.dailyChallengeCompleted || false
      }
    });
  } catch (error) {
    console.error('Error fetching detailed stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching detailed stats'
    });
  }
});

// Check if daily challenge is available
router.get('/daily-challenge-status', verifyToken, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id).select('quizStats');
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    const today = new Date().toDateString();
    const lastQuizDate = volunteer.quizStats?.lastQuizDate ? 
      new Date(volunteer.quizStats.lastQuizDate).toDateString() : null;
    
    const dailyChallengeCompleted = volunteer.quizStats?.dailyChallengeCompleted || false;
    const canTakeDaily = !dailyChallengeCompleted || lastQuizDate !== today;

    res.json({
      success: true,
      data: {
        canTakeDailyChallenge: canTakeDaily,
        lastCompletedDate: lastQuizDate,
        currentStreak: volunteer.quizStats?.quizStreak || 0
      }
    });
  } catch (error) {
    console.error('Error checking daily challenge status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking daily challenge status'
    });
  }
});

module.exports = router;