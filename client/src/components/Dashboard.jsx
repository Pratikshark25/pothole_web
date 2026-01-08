import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [potholes, setPotholes] = useState({
    reported: [],
    underRepair: [],
    finished: []
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const [activeTab, setActiveTab] = useState('reported');
  
  // Reward system state
  const [rewardData, setRewardData] = useState({
    points: 0,
    totalReports: 0,
    completedReports: 0,
    achievements: [],
    level: 1,
    experiencePoints: 0
  });
  const [showRewards, setShowRewards] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch pothole data with real-time updates
  const fetchPotholeData = async () => {
    try {
      const res = await fetch(`${API_BASE}/report/pothole/${user.id}`);
      const data = await res.json();
      setPotholes(data);
      setLastUpdated(new Date());

      await fetchRewardData();
    } catch (err) {
      // Silent fail
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPotholeData();
  }, [user.id]);

  // Real-time polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPotholeData();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [user.id]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPotholeData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Show achievement notification
  const showAchievementNotification = (achievement) => {
    const notification = {
      id: Date.now(),
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      message: `You unlocked "${achievement.name}"`,
      icon: achievement.icon,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 10000);
  };

  // Fetch reward data
  const fetchRewardData = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const newAchievements = data.user.achievements || [];
        const currentAchievementNames = rewardData.achievements.map(a => a.name);

        // Check for new achievements
        const newlyUnlocked = newAchievements.filter(
          achievement => !currentAchievementNames.includes(achievement.name)
        );

        // Show notifications for new achievements
        newlyUnlocked.forEach(achievement => {
          showAchievementNotification(achievement);
        });

        setRewardData({
          points: data.user.rewardPoints || 0,
          totalReports: data.user.totalReports || 0,
          completedReports: data.user.completedReports || 0,
          achievements: newAchievements,
          level: data.user.level || 1,
          experiencePoints: data.user.experiencePoints || 0
        });
      }
    } catch (err) {
      // Silent fail
    }
  };

  // Fetch reward data
  useEffect(() => {
    fetchRewardData();
  }, []);

  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const viewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const viewMap = (mapUrl) => {
    window.open(mapUrl, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPointsForSeverity = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 50;
      case 'medium': return 30;
      case 'low': return 20;
      default: return 0;
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 12px;
          margin: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          border-radius: 12px;
          border: 2px solid #1f2937;
          transition: all 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #9ca3af, #6b7280);
          transform: scale(1.1);
        }
        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
        .gradient-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        }
        .tab-active {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        .tab-inactive {
          background: rgba(75, 85, 99, 0.2);
          color: #9ca3af;
        }
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 768px) {
          .table-responsive table {
            min-width: 600px;
          }
        }
      `}</style>
      
      <div className="min-h-screen gradient-bg">
        {/* Achievement Notifications */}
        {/* {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 border border-green-500/50 rounded-lg p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-2 duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{notification.icon}</div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">{notification.title}</div>
                    <div className="text-green-100 text-sm">{notification.message}</div>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    className="text-green-200 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )} */}

        {/* Header */}
        <div className="glass-effect border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Pothole Tracker
                </h1>
                <p className="text-gray-400 mt-1">Welcome back, {user?.name}!</p>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors disabled:cursor-not-allowed"
                  title="Refresh data"
                >
                  <svg className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Level {rewardData.level} • {rewardData.points} XP</div>
                  <div className="text-lg font-bold text-yellow-400">🏆 {rewardData.points} Points</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{potholes.reported.length}</div>
              <div className="text-sm text-gray-400">Reported</div>
            </div>

            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{potholes.underRepair.length}</div>
              <div className="text-sm text-gray-400">Under Review</div>
            </div>

            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{potholes.finished.length}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="glass-effect rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Rewards & Achievements</h2>
              <button
                onClick={() => setShowRewards(!showRewards)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                {showRewards ? 'Hide Rewards' : 'View Rewards'}
              </button>
            </div>

            {showRewards && (
              <div className="space-y-6">
                {/* Level and XP Progress */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Level {rewardData.level}</h3>
                      <p className="text-gray-400">Community Contributor</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400">{rewardData.points} XP</div>
                      <div className="text-sm text-gray-400">Total Points</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{width: `${(rewardData.experiencePoints / 100) * 100}%`}}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{rewardData.experiencePoints} / 100 XP to next level</span>
                    <span>Level {rewardData.level + 1}</span>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Achievement Badges</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className={`bg-gradient-to-br from-green-600/20 to-emerald-600/20 border rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 ${
                      rewardData.totalReports >= 1 ? 'border-green-500/50' : 'border-gray-600/50'
                    }`}>
                      <div className={`text-4xl mb-2 ${rewardData.totalReports >= 1 ? 'opacity-100' : 'opacity-50'}`}>🏆</div>
                      <div className={`text-lg font-bold mb-1 ${rewardData.totalReports >= 1 ? 'text-green-400' : 'text-gray-500'}`}>
                        First Reporter
                      </div>
                      <div className="text-sm text-gray-400">Report 1 pothole</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.min(rewardData.totalReports, 1)} / 1
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 ${
                      rewardData.totalReports >= 5 ? 'border-blue-500/50' : 'border-gray-600/50'
                    }`}>
                      <div className={`text-4xl mb-2 ${rewardData.totalReports >= 5 ? 'opacity-100' : 'opacity-50'}`}>🌟</div>
                      <div className={`text-lg font-bold mb-1 ${rewardData.totalReports >= 5 ? 'text-blue-400' : 'text-gray-500'}`}>
                        Community Helper
                      </div>
                      <div className="text-sm text-gray-400">Report 5 potholes</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.min(rewardData.totalReports, 5)} / 5
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br from-purple-600/20 to-pink-600/20 border rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 ${
                      rewardData.totalReports >= 10 ? 'border-purple-500/50' : 'border-gray-600/50'
                    }`}>
                      <div className={`text-4xl mb-2 ${rewardData.totalReports >= 10 ? 'opacity-100' : 'opacity-50'}`}>🛡️</div>
                      <div className={`text-lg font-bold mb-1 ${rewardData.totalReports >= 10 ? 'text-purple-400' : 'text-gray-500'}`}>
                        City Guardian
                      </div>
                      <div className="text-sm text-gray-400">Report 10 potholes</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.min(rewardData.totalReports, 10)} / 10
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br from-red-600/20 to-pink-600/20 border rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 ${
                      rewardData.totalReports >= 25 ? 'border-red-500/50' : 'border-gray-600/50'
                    }`}>
                      <div className={`text-4xl mb-2 ${rewardData.totalReports >= 25 ? 'opacity-100' : 'opacity-50'}`}>⚔️</div>
                      <div className={`text-lg font-bold mb-1 ${rewardData.totalReports >= 25 ? 'text-red-400' : 'text-gray-500'}`}>
                        Road Warrior
                      </div>
                      <div className="text-sm text-gray-400">Report 25 potholes</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.min(rewardData.totalReports, 25)} / 25
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 ${
                      rewardData.points >= 500 ? 'border-yellow-500/50' : 'border-gray-600/50'
                    }`}>
                      <div className={`text-4xl mb-2 ${rewardData.points >= 500 ? 'opacity-100' : 'opacity-50'}`}>💎</div>
                      <div className={`text-lg font-bold mb-1 ${rewardData.points >= 500 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        Point Master
                      </div>
                      <div className="text-sm text-gray-400">Earn 500 points</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.min(rewardData.points, 500)} / 500
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 ${
                      rewardData.completedReports >= 10 ? 'border-indigo-500/50' : 'border-gray-600/50'
                    }`}>
                      <div className={`text-4xl mb-2 ${rewardData.completedReports >= 10 ? 'opacity-100' : 'opacity-50'}`}>🏅</div>
                      <div className={`text-lg font-bold mb-1 ${rewardData.completedReports >= 10 ? 'text-indigo-400' : 'text-gray-500'}`}>
                        Completion Champion
                      </div>
                      <div className="text-sm text-gray-400">Get 10 potholes completed</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.min(rewardData.completedReports, 10)} / 10
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🔴</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">High Severity</div>
                        <div className="text-sm text-gray-400">50 points each</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🟡</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">Medium Severity</div>
                        <div className="text-sm text-gray-400">30 points each</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🟢</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">Low Severity</div>
                        <div className="text-sm text-gray-400">20 points each</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{rewardData.totalReports}</div>
                    <div className="text-sm text-gray-400">Total Reports</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">{rewardData.completedReports}</div>
                    <div className="text-sm text-gray-400">Completed</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {rewardData.totalReports > 0 ? Math.round((rewardData.completedReports / rewardData.totalReports) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{rewardData.level}</div>
                    <div className="text-sm text-gray-400">Current Level</div>
                  </div>
                </div>

                {/* Reward Suggestions */}
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-3">💡 Reward Suggestions</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>• Keep reporting potholes to unlock more achievements!</div>
                    <div>• Higher severity reports earn more points</div>
                    <div>• Reach level 5 to become a "Road Safety Champion"</div>
                    <div>• Share your achievements on social media</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="glass-effect rounded-2xl p-6 mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveTab('reported')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'reported' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                Reported Potholes ({potholes.reported.length})
              </button>
              <button
                onClick={() => setActiveTab('underRepair')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'underRepair' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                Under Review ({potholes.underRepair.length})
              </button>
              <button
                onClick={() => setActiveTab('finished')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'finished' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                Completed ({potholes.finished.length})
              </button>
            </div>

            {/* Reported Potholes Table */}
            {activeTab === 'reported' && (
              <div className="table-responsive">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-4 pr-4 text-left text-gray-400 font-medium">Reported By</th>
                      <th className="pb-4 pr-4 text-left text-gray-400 font-medium">Location</th>
                      <th className="pb-4 pr-4 text-left text-gray-400 font-medium">Date</th>
                      <th className="pb-4 pr-4 text-left text-gray-400 font-medium">Severity</th>
                      <th className="pb-4 pr-4 text-left text-gray-400 font-medium">Points</th>
                      <th className="pb-4 pr-4 text-left text-gray-400 font-medium">Description</th>
                      <th className="pb-4 pr-4 text-left text-gray-400 font-medium">Image</th>
                      <th className="pb-4 text-left text-gray-400 font-medium">Map</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {potholes.reported.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-400">
                          No reported potholes found
                        </td>
                      </tr>
                    ) : (
                      potholes.reported.map((pothole) => (
                        <tr key={pothole.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 pr-4 text-white whitespace-nowrap">
                            {user?.name || 'You'}
                          </td>
                          <td className="py-4 pr-4 text-gray-300">
                            {pothole.location}
                          </td>
                          <td className="py-4 pr-4 text-gray-300 whitespace-nowrap">
                            {formatDate(pothole.createdAt || pothole.dateOfSubmission)}
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getSeverityColor(pothole.severity)}`}>
                              {pothole.severity?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium whitespace-nowrap">
                              +{getPointsForSeverity(pothole.severity)}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-gray-300 max-w-xs">
                            <div title={pothole.description}>
                              {truncateText(pothole.description)}
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <button
                              onClick={() => viewImage(pothole.image)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                            >
                              View Image
                            </button>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => viewMap(pothole.mapUrl)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                            >
                              View Map
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Under Repair Table */}
            {activeTab === 'underRepair' && (
              <div className="table-responsive">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-4 text-gray-400 font-medium">Assigned To</th>
                      <th className="pb-4 text-gray-400 font-medium">Location</th>
                      <th className="pb-4 text-gray-400 font-medium">Date Assigned</th>
                      <th className="pb-4 text-gray-400 font-medium">Severity</th>
                      <th className="pb-4 text-gray-400 font-medium">Status</th>
                      <th className="pb-4 text-gray-400 font-medium">Potential Points</th>
                      <th className="pb-4 text-gray-400 font-medium">Description</th>
                      <th className="pb-4 text-gray-400 font-medium">Image</th>
                      <th className="pb-4 text-gray-400 font-medium">Map</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {potholes.underRepair.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-gray-400">
                          No potholes under repair
                        </td>
                      </tr>
                    ) : (
                      potholes.underRepair.map((pothole) => (
                        <tr key={pothole.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 text-white">
                            Municipality
                          </td>
                          <td className="py-4 text-gray-300">
                            {pothole.location}
                          </td>
                          <td className="py-4 text-gray-300">
                            {pothole.assignedDate ? formatDate(pothole.assignedDate) : 'N/A'}
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(pothole.severity)}`}>
                              {pothole.severity?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-medium">
                              {pothole.status === 'assigned' ? 'ASSIGNED' : 'IN PROGRESS'}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium">
                              +{getPointsForSeverity(pothole.severity)}
                            </span>
                          </td>
                          <td className="py-4 text-gray-300 max-w-xs">
                            <div title={pothole.description}>
                              {truncateText(pothole.description)}
                            </div>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => viewImage(pothole.image)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                              View Image
                            </button>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => viewMap(pothole.mapUrl)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                            >
                              View Map
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Completed Table */}
            {activeTab === 'finished' && (
              <div className="table-responsive">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-4 text-gray-400 font-medium">Completed By</th>
                      <th className="pb-4 text-gray-400 font-medium">Location</th>
                      <th className="pb-4 text-gray-400 font-medium">Date Completed</th>
                      <th className="pb-4 text-gray-400 font-medium">Severity</th>
                      <th className="pb-4 text-gray-400 font-medium">Points Earned</th>
                      <th className="pb-4 text-gray-400 font-medium">Completion Notes</th>
                      <th className="pb-4 text-gray-400 font-medium">Original Image</th>
                      <th className="pb-4 text-gray-400 font-medium">Completion Image</th>
                      <th className="pb-4 text-gray-400 font-medium">Map</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {potholes.finished.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-gray-400">
                          No completed potholes
                        </td>
                      </tr>
                    ) : (
                      potholes.finished.map((pothole) => (
                        <tr key={pothole.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 text-white">
                            Municipality
                          </td>
                          <td className="py-4 text-gray-300">
                            {pothole.location}
                          </td>
                          <td className="py-4 text-gray-300">
                            {pothole.dateOfCompletion ? formatDate(pothole.dateOfCompletion) : 'N/A'}
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(pothole.severity)}`}>
                              {pothole.severity?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-medium">
                              +{getPointsForSeverity(pothole.severity)} ✓
                            </span>
                          </td>
                          <td className="py-4 text-gray-300 max-w-xs">
                            <div title={pothole.completionNotes || 'No notes provided'}>
                              {truncateText(pothole.completionNotes || 'No notes provided')}
                            </div>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => viewImage(pothole.image)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                              View Original
                            </button>
                          </td>
                          <td className="py-4">
                            {pothole.completionImage ? (
                              <button
                                onClick={() => viewImage(pothole.completionImage)}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                              >
                                View Completion
                              </button>
                            ) : (
                              <span className="text-gray-500 text-sm">No image</span>
                            )}
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => viewMap(pothole.mapUrl)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                            >
                              View Map
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors duration-200"
              >
                ✕
              </button>
              <img
                src={selectedImage.startsWith('data:') ? selectedImage : `${API_BASE}/uploads/${selectedImage}`}
                alt="Pothole"
                className="max-w-full max-h-[90vh] object-contain rounded-xl"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
