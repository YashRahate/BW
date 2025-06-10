const express = require('express');
const jwt = require('jsonwebtoken');
const { Volunteer, Event, WasteCollected } = require('../models');

const router = express.Router();

// Middleware to authenticate and get volunteer
const authenticateVolunteer = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const volunteer = await Volunteer.findById(decoded.id);

    if (!volunteer) {
      return res.status(404).json({ 
        success: false,
        message: 'Volunteer not found' 
      });
    }

    req.volunteer = volunteer;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token',
      error: error.message 
    });
  }
};

// Get gamification data for volunteer
router.get('/profile', authenticateVolunteer, async (req, res) => {
  try {
    const volunteer = req.volunteer;
    const currentDate = new Date();
    
    // Calculate streak
    const streak = await calculateStreak(volunteer._id);
    
    // Get level and progress
    const level = Math.floor(volunteer.rewardPoints / 100) + 1;
    const pointsToNextLevel = 100 - (volunteer.rewardPoints % 100);
    const progressPercentage = ((volunteer.rewardPoints % 100) / 100) * 100;
    
    // Get achievements
    const achievements = await calculateAchievements(volunteer);
    
    // Get recent activities
    const recentActivities = await getRecentActivities(volunteer._id);
    
    // Get leaderboard position
    const leaderboardPosition = await getLeaderboardPosition(volunteer._id);
    
    res.status(200).json({
      success: true,
      data: {
        volunteer: {
          name: volunteer.name,
          rewardPoints: volunteer.rewardPoints || 0,
          wasteCollected: volunteer.wasteCollected || 0,
          participationHistory: volunteer.participationHistory || []
        },
        gamification: {
          level,
          pointsToNextLevel,
          progressPercentage,
          streak,
          achievements,
          recentActivities,
          leaderboardPosition: leaderboardPosition || 1
        }
      }
    });
  } catch (error) {
    console.error('Gamification profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching gamification data',
      error: error.message 
    });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticateVolunteer, async (req, res) => {
  try {
    const topVolunteers = await Volunteer.find()
      .select('name rewardPoints wasteCollected participationHistory')
      .sort({ rewardPoints: -1 })
      .limit(10);

    const leaderboard = topVolunteers.map((volunteer, index) => ({
      rank: index + 1,
      name: volunteer.name,
      points: volunteer.rewardPoints || 0,
      wasteCollected: volunteer.wasteCollected || 0,
      eventsParticipated: volunteer.participationHistory ? volunteer.participationHistory.length : 0,
      level: Math.floor((volunteer.rewardPoints || 0) / 100) + 1
    }));

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching leaderboard',
      error: error.message 
    });
  }
});

// Award points for event participation
router.post('/award-points', authenticateVolunteer, async (req, res) => {
  try {
    const { eventId, wasteCollected, pointsEarned } = req.body;
    const volunteer = req.volunteer;

    // Update volunteer points and waste collected
    volunteer.rewardPoints += pointsEarned;
    volunteer.wasteCollected += wasteCollected;
    
    // Add event to participation history if not already there
    if (!volunteer.participationHistory.includes(eventId)) {
      volunteer.participationHistory.push(eventId);
    }

    await volunteer.save();

    res.json({
      success: true,
      message: 'Points awarded successfully',
      data: {
        newPoints: volunteer.rewardPoints,
        pointsEarned,
        newLevel: Math.floor(volunteer.rewardPoints / 100) + 1
      }
    });
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
async function calculateStreak(volunteerId) {
  try {
    const volunteer = await Volunteer.findById(volunteerId).populate('participationHistory');
    
    if (!volunteer.participationHistory.length) return 0;

    // Get events sorted by date
    const events = await Event.find({
      _id: { $in: volunteer.participationHistory }
    }).sort({ dateOfEvent: -1 });

    if (!events.length) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's an event in the last 7 days
    const lastEventDate = new Date(events[0].dateOfEvent);
    lastEventDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((today - lastEventDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 7) return 0; // Streak broken if no activity in 7 days

    // Calculate consecutive weeks with activity
    let currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    
    for (const event of events) {
      const eventDate = new Date(event.dateOfEvent);
      const eventWeekStart = new Date(eventDate);
      eventWeekStart.setDate(eventDate.getDate() - eventDate.getDay());
      
      const weekDiff = Math.ceil((currentWeekStart - eventWeekStart) / (1000 * 60 * 60 * 24 * 7));
      
      if (weekDiff === streak) {
        streak++;
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Calculate streak error:', error);
    return 0;
  }
}

async function calculateAchievements(volunteer) {
  const achievements = [];

  // Points-based achievements
  if (volunteer.rewardPoints >= 100) achievements.push({ id: 'first_hundred', name: 'First 100 Points', description: 'Earned your first 100 points!', icon: '🎯' });
  if (volunteer.rewardPoints >= 500) achievements.push({ id: 'five_hundred', name: 'Point Collector', description: 'Reached 500 points!', icon: '⭐' });
  if (volunteer.rewardPoints >= 1000) achievements.push({ id: 'thousand', name: 'Point Master', description: 'Achieved 1000 points!', icon: '🏆' });

  // Waste collection achievements
  if (volunteer.wasteCollected >= 10) achievements.push({ id: 'first_ten_kg', name: 'Clean Starter', description: 'Collected 10kg of waste!', icon: '🌊' });
  if (volunteer.wasteCollected >= 50) achievements.push({ id: 'fifty_kg', name: 'Beach Guardian', description: 'Collected 50kg of waste!', icon: '🏖️' });
  if (volunteer.wasteCollected >= 100) achievements.push({ id: 'hundred_kg', name: 'Ocean Hero', description: 'Collected 100kg of waste!', icon: '🌊' });

  // Participation achievements
  if (volunteer.participationHistory.length >= 1) achievements.push({ id: 'first_event', name: 'First Steps', description: 'Participated in your first cleanup!', icon: '👣' });
  if (volunteer.participationHistory.length >= 5) achievements.push({ id: 'five_events', name: 'Regular Volunteer', description: 'Participated in 5 cleanups!', icon: '🔄' });
  if (volunteer.participationHistory.length >= 10) achievements.push({ id: 'ten_events', name: 'Dedicated Volunteer', description: 'Participated in 10 cleanups!', icon: '💪' });

  return achievements;
}

async function getRecentActivities(volunteerId) {
  try {
    const volunteer = await Volunteer.findById(volunteerId).populate({
      path: 'participationHistory',
      options: { sort: { dateOfEvent: -1 }, limit: 5 }
    });

    return volunteer.participationHistory.map(event => ({
      type: 'event_participation',
      eventName: event.name,
      date: event.dateOfEvent,
      beachName: event.beachName
    }));
  } catch (error) {
    console.error('Get recent activities error:', error);
    return [];
  }
}

async function getLeaderboardPosition(volunteerId) {
  try {
    const volunteer = await Volunteer.findById(volunteerId);
    const rank = await Volunteer.countDocuments({
      rewardPoints: { $gt: volunteer.rewardPoints }
    }) + 1;

    return rank;
  } catch (error) {
    console.error('Get leaderboard position error:', error);
    return null;
  }
}

module.exports = router;