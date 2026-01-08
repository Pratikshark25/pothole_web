const User = require('../models/User');

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_REPORTER: {
    name: 'First Reporter',
    description: 'Report your first pothole',
    icon: '🏆',
    condition: (user) => user.totalReports >= 1
  },
  COMMUNITY_HELPER: {
    name: 'Community Helper',
    description: 'Report 5 potholes to help your community',
    icon: '🌟',
    condition: (user) => user.totalReports >= 5
  },
  CITY_GUARDIAN: {
    name: 'City Guardian',
    description: 'Report 10 potholes and become a city guardian',
    icon: '🛡️',
    condition: (user) => user.totalReports >= 10
  },
  ROAD_WARRIOR: {
    name: 'Road Warrior',
    description: 'Report 25 potholes and master the roads',
    icon: '⚔️',
    condition: (user) => user.totalReports >= 25
  },
  POINT_MASTER: {
    name: 'Point Master',
    description: 'Earn 500 reward points',
    icon: '💎',
    condition: (user) => user.rewardPoints >= 500
  },
  COMPLETION_CHAMPION: {
    name: 'Completion Champion',
    description: 'Get 10 potholes completed successfully',
    icon: '🏅',
    condition: (user) => user.completedReports >= 10
  },
  PERFECT_SCORE: {
    name: 'Perfect Score',
    description: 'Achieve 100% completion rate with 5+ reports',
    icon: '🎯',
    condition: (user) => user.totalReports >= 5 && user.completedReports === user.totalReports
  }
};

// Check and unlock achievements for a user
const checkAndUnlockAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const newAchievements = [];
    const existingAchievementNames = user.achievements.map(a => a.name);

    // Check each achievement
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      // Skip if already unlocked
      if (existingAchievementNames.includes(achievement.name)) return;

      // Check if condition is met
      if (achievement.condition(user)) {
        newAchievements.push({
          name: achievement.name,
          description: achievement.description,
          unlockedAt: new Date(),
          icon: achievement.icon
        });
      }
    });

    // Add new achievements to user
    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
      await user.save();
      return newAchievements;
    }

    return [];
  } catch (error) {
    return [];
  }
};

// Calculate user level based on reward points
const calculateLevel = (rewardPoints) => {
  return Math.floor(rewardPoints / 100) + 1;
};

// Calculate experience points within current level
const calculateExperiencePoints = (rewardPoints) => {
  return rewardPoints % 100;
};

// Get reward points for severity
const getRewardPointsForSeverity = (severity) => {
  switch(severity.toLowerCase()) {
    case 'high': return 50;
    case 'medium': return 30;
    case 'low': return 20;
    default: return 0;
  }
};

module.exports = {
  checkAndUnlockAchievements,
  calculateLevel,
  calculateExperiencePoints,
  getRewardPointsForSeverity,
  ACHIEVEMENTS
};
