import React, { useState, useEffect } from 'react';
import './Gamification.css';

const Gamification = () => {
  const [gamificationData, setGamificationData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGamificationData();
    fetchLeaderboard();
  }, []);

  const fetchGamificationData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/gamification/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      setGamificationData(data.data);
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available for leaderboard');
        return;
      }

      const response = await fetch('http://localhost:3000/api/gamification/leaderboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Leaderboard response error:', errorText);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON leaderboard response:', responseText);
        return;
      }

      const data = await response.json();
      setLeaderboard(data.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 10) return '🔥';
    if (streak >= 5) return '⚡';
    if (streak >= 3) return '✨';
    return '💫';
  };

  const getLevelTitle = (level) => {
    if (level >= 20) return 'Ocean Master';
    if (level >= 15) return 'Beach Guardian';
    if (level >= 10) return 'Clean Champion';
    if (level >= 5) return 'Eco Warrior';
    return 'Beach Cleaner';
  };

  if (loading) {
    return (
      <div className="gamification-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gamification-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchGamificationData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!gamificationData) {
    return (
      <div className="gamification-container">
        <div className="no-data">
          <p>No gamification data available</p>
        </div>
      </div>
    );
  }

  const { volunteer, gamification } = gamificationData;

  return (
    <div className="gamification-container">
      <div className="gamification-header">
        <div className="user-stats">
          <div className="user-avatar">
            <span className="avatar-emoji">🌊</span>
          </div>
          <div className="user-info">
            <h2>{volunteer.name}</h2>
            <p className="user-title">{getLevelTitle(gamification.level)}</p>
          </div>
        </div>
        
        <div className="level-progress">
          <div className="level-info">
            <span className="current-level">Level {gamification.level}</span>
            <span className="points-to-next">{gamification.pointsToNextLevel} to next level</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${gamification.progressPercentage}%` }}
            ></div>
          </div>
          <div className="total-points">{volunteer.rewardPoints} points</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card streak-card">
          <div className="stat-icon">{getStreakEmoji(gamification.streak)}</div>
          <div className="stat-value">{gamification.streak}</div>
          <div className="stat-label">Week Streak</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🗑️</div>
          <div className="stat-value">{volunteer.wasteCollected}kg</div>
          <div className="stat-label">Waste Collected</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏖️</div>
          <div className="stat-value">{volunteer.participationHistory.length}</div>
          <div className="stat-label">Events Joined</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">#{gamification.leaderboardPosition}</div>
          <div className="stat-label">Rank</div>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {gamification.recentActivities.length > 0 ? (
                  gamification.recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">🌊</div>
                      <div className="activity-details">
                        <p className="activity-title">Participated in {activity.eventName}</p>
                        <p className="activity-subtitle">
                          {activity.beachName} • {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-activity">No recent activities</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <h3>Your Achievements</h3>
            <div className="achievements-grid">
              {gamification.achievements.length > 0 ? (
                gamification.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-card earned">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <h4>{achievement.name}</h4>
                      <p>{achievement.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-achievements">No achievements yet. Keep participating to earn badges!</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-tab">
            <h3>Top Volunteers</h3>
            <div className="leaderboard-list">
              {leaderboard.map((user, index) => (
                <div key={index} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                  <div className="rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${user.rank}`}
                  </div>
                  <div className="user-details">
                    <p className="username">{user.name}</p>
                    <p className="user-stats-small">
                      Level {user.level} • {user.eventsParticipated} events
                    </p>
                  </div>
                  <div className="user-points">
                    <span className="points">{user.points}</span>
                    <span className="points-label">points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gamification;