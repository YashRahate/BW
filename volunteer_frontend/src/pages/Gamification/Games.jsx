import React, { useState, useEffect } from 'react';
import './Games.css';

// Sample quiz data - you can move this to a separate file
const quizQuestions = {
  level1: [
    {
      type: 'multiple_choice',
      question: 'What percentage of plastic waste ends up in our oceans?',
      options: ['5%', '15%', '25%', '40%'],
      correct: 2,
      points: 10,
      explanation: 'Approximately 25% of plastic waste ends up in our oceans, causing severe marine pollution.'
    },
    {
      type: 'true_false',
      question: 'Plastic bags take over 100 years to decompose.',
      correct: true,
      points: 10,
      explanation: 'Plastic bags can take 100-1000 years to decompose completely in the environment.'
    }
  ],
  level2: [
    {
      type: 'multiple_choice',
      question: 'Which type of plastic is most commonly found on beaches?',
      options: ['Water bottles', 'Food containers', 'Cigarette butts', 'Plastic bags'],
      correct: 2,
      points: 15,
      explanation: 'Cigarette butts are the most common type of litter found on beaches worldwide.'
    }
  ],
  level3: [
    {
      type: 'drag_drop',
      question: 'Match these items with their decomposition time:',
      items: ['Glass bottle', 'Aluminum can', 'Plastic bottle'],
      categories: ['1 million years', '80-100 years', '450 years'],
      correct: [0, 1, 2],
      points: 20,
      explanation: 'Different materials have vastly different decomposition times in the environment.'
    }
  ],
  dailyChallenges: [
    {
      type: 'multiple_choice',
      question: 'What is the Great Pacific Garbage Patch?',
      options: ['A recycling facility', 'A collection of marine debris', 'A beach cleanup site', 'A research station'],
      correct: 1,
      points: 25,
      explanation: 'The Great Pacific Garbage Patch is a collection of marine debris in the North Pacific Ocean.'
    }
  ]
};

const achievementBadges = {
  perfect_score: { name: 'Perfect Score', icon: '🏆', description: 'Scored 100% on a quiz' },
  weekly_warrior: { name: 'Weekly Warrior', icon: '🔥', description: 'Maintained a 7-day streak' },
  point_master: { name: 'Point Master', icon: '💎', description: 'Earned 1000+ points' }
};

const levelRequirements = {
  1: { name: 'Beach Explorer', minPoints: 0, color: '#4CAF50' },
  2: { name: 'Ocean Guardian', minPoints: 100, color: '#2196F3' },
  3: { name: 'Marine Protector', minPoints: 500, color: '#9C27B0' },
  4: { name: 'Environmental Hero', minPoints: 1000, color: '#FF9800' }
};

const Games = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState('level');
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    correctAnswers: 0,
    quizStreak: 0,
    completedLevels: [],
    badges: []
  });
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [draggedItems, setDraggedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canTakeDailyChallenge, setCanTakeDailyChallenge] = useState(true);

  useEffect(() => {
    loadUserStats();
    checkDailyChallengeStatus();
    loadQuestions();
  }, [currentLevel, gameMode]);

  useEffect(() => {
    if (timeLeft > 0 && gameMode === 'daily') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, gameMode]);

  const loadUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access games');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/games/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load user stats');
      }

      const data = await response.json();
      if (data.success) {
        setUserStats(data.data.quizStats);
      }
    } catch (err) {
      console.error('Error loading user stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkDailyChallengeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/games/daily-challenge-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCanTakeDailyChallenge(data.data.canTakeDailyChallenge);
      }
    } catch (err) {
      console.error('Error checking daily challenge status:', err);
    }
  };

  const updateUserStats = async (statsUpdate) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/games/update-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statsUpdate)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserStats(data.data.quizStats);
          if (data.data.autoAwardedBadges.length > 0) {
            alert(`New badges earned: ${data.data.autoAwardedBadges.join(', ')}`);
          }
        }
      }
    } catch (err) {
      console.error('Error updating user stats:', err);
    }
  };

  const loadQuestions = () => {
    let levelQuestions = [];
    
    if (gameMode === 'level') {
      levelQuestions = quizQuestions[`level${currentLevel}`] || [];
    } else if (gameMode === 'daily') {
      if (!canTakeDailyChallenge) {
        alert('You have already completed today\'s daily challenge!');
        return;
      }
      levelQuestions = quizQuestions.dailyChallenges;
      setTimeLeft(120);
    } else {
      levelQuestions = [
        ...quizQuestions.level1,
        ...quizQuestions.level2,
        ...quizQuestions.level3
      ].sort(() => Math.random() - 0.5).slice(0, 10);
    }
    
    setQuestions(shuffleArray(levelQuestions));
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsAnswered(false);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswer = (answerIndex, isCorrect = null) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const question = questions[currentQuestion];
    let correct = false;
    
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      correct = answerIndex === question.correct;
    } else if (question.type === 'multiple_select') {
      correct = JSON.stringify(answerIndex.sort()) === JSON.stringify(question.correct.sort());
    } else if (question.type === 'fill_blank') {
      correct = question.correct.some(answer => 
        answerIndex.toLowerCase().trim() === answer.toLowerCase()
      );
    } else if (isCorrect !== null) {
      correct = isCorrect;
    }
    
    if (correct) {
      setScore(score + question.points);
    }
    
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsAnswered(false);
      setDraggedItems([]);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = totalPossiblePoints > 0 ? (score / totalPossiblePoints) * 100 : 0;
    const correctCount = questions.filter((_, index) => {
      // This is simplified - you'd need to track correct answers during the quiz
      return true; // Placeholder
    }).length;

    const newBadges = [];
    if (percentage === 100) newBadges.push('perfect_score');

    const statsUpdate = {
      pointsEarned: score,
      correctAnswers: correctCount,
      gameMode: gameMode,
      levelCompleted: gameMode === 'level' ? currentLevel : null,
      percentage: percentage,
      newBadges: newBadges
    };

    await updateUserStats(statsUpdate);
    
    if (gameMode === 'daily') {
      setCanTakeDailyChallenge(false);
    }

    alert(`Quiz Complete! Score: ${score} points (${percentage.toFixed(1)}%)`);
  };

  const handleDragDrop = (item, category) => {
    const newDraggedItems = [...draggedItems];
    const itemIndex = newDraggedItems.findIndex(d => d.item === item);
    
    if (itemIndex >= 0) {
      newDraggedItems[itemIndex] = { item, category };
    } else {
      newDraggedItems.push({ item, category });
    }
    
    setDraggedItems(newDraggedItems);
    
    if (newDraggedItems.length === questions[currentQuestion].items.length) {
      const question = questions[currentQuestion];
      const isCorrect = question.items.every((item, index) => {
        const draggedItem = newDraggedItems.find(d => d.item === item);
        return draggedItem && question.categories.indexOf(draggedItem.category) === question.correct[index];
      });
      handleAnswer(newDraggedItems, isCorrect);
    }
  };

  const renderQuestion = () => {
    if (!questions.length || currentQuestion >= questions.length) return null;
    
    const question = questions[currentQuestion];
    
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="question-container">
            <h3 className="question-text">{question.question}</h3>
            <div className="options-grid">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === index ? 
                    (index === question.correct ? 'correct' : 'incorrect') : ''}`}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  style={{
                    padding: '12px 16px',
                    margin: '8px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: selectedAnswer === index ? 
                      (index === question.correct ? '#4CAF50' : '#f44336') : '#fff',
                    color: selectedAnswer === index ? '#fff' : '#333',
                    cursor: isAnswered ? 'default' : 'pointer'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'true_false':
        return (
          <div className="question-container">
            <h3 className="question-text">{question.question}</h3>
            <div className="true-false-container" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                className={`tf-btn true ${selectedAnswer === true ? 
                  (question.correct ? 'correct' : 'incorrect') : ''}`}
                onClick={() => handleAnswer(true)}
                disabled={isAnswered}
                style={{
                  padding: '16px 32px',
                  border: '2px solid #4CAF50',
                  borderRadius: '8px',
                  backgroundColor: selectedAnswer === true ? 
                    (question.correct ? '#4CAF50' : '#f44336') : '#fff',
                  color: selectedAnswer === true ? '#fff' : '#4CAF50',
                  cursor: isAnswered ? 'default' : 'pointer'
                }}
              >
                ✓ True
              </button>
              <button
                className={`tf-btn false ${selectedAnswer === false ? 
                  (!question.correct ? 'correct' : 'incorrect') : ''}`}
                onClick={() => handleAnswer(false)}
                disabled={isAnswered}
                style={{
                  padding: '16px 32px',
                  border: '2px solid #f44336',
                  borderRadius: '8px',
                  backgroundColor: selectedAnswer === false ? 
                    (!question.correct ? '#4CAF50' : '#f44336') : '#fff',
                  color: selectedAnswer === false ? '#fff' : '#f44336',
                  cursor: isAnswered ? 'default' : 'pointer'
                }}
              >
                ✗ False
              </button>
            </div>
          </div>
        );
        
      case 'drag_drop':
        return (
          <div className="question-container">
            <h3 className="question-text">{question.question}</h3>
            <div className="drag-drop-container" style={{ display: 'flex', gap: '32px', justifyContent: 'space-between' }}>
              <div className="items-to-drag" style={{ flex: 1 }}>
                <h4>Items:</h4>
                {question.items.map((item, index) => (
                  <div
                    key={index}
                    className={`draggable-item ${draggedItems.some(d => d.item === item) ? 'dragged' : ''}`}
                    style={{
                      padding: '12px',
                      margin: '8px 0',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: draggedItems.some(d => d.item === item) ? '#e0e0e0' : '#fff',
                      cursor: 'pointer',
                      opacity: draggedItems.some(d => d.item === item) ? 0.5 : 1
                    }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="drop-categories" style={{ flex: 1 }}>
                <h4>Categories:</h4>
                {question.categories.map((category, index) => (
                  <div
                    key={index}
                    className="drop-zone"
                    style={{
                      minHeight: '60px',
                      margin: '8px 0',
                      padding: '12px',
                      border: '2px dashed #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9'
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const item = e.dataTransfer.getData('text/plain');
                      handleDragDrop(item, category);
                    }}
                    onClick={() => {
                      const availableItems = question.items.filter(item => 
                        !draggedItems.some(d => d.item === item)
                      );
                      if (availableItems.length > 0) {
                        handleDragDrop(availableItems[0], category);
                      }
                    }}
                  >
                    <strong>{category}</strong>
                    {draggedItems
                      .filter(d => d.category === category)
                      .map((d, i) => (
                        <div key={i} className="dropped-item" style={{
                          marginTop: '8px',
                          padding: '4px 8px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>{d.item}</div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Question type not supported</div>;
    }
  };

  const getCurrentLevel = () => {
    const userLevel = Object.keys(levelRequirements).reverse().find(level => 
      userStats.totalPoints >= levelRequirements[level].minPoints
    );
    return parseInt(userLevel) || 1;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'red' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="games-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header with user progress */}
      <div className="games-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px'
      }}>
        <div className="user-level" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="level-badge" style={{ 
            backgroundColor: levelRequirements[getCurrentLevel()].color,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            Level {getCurrentLevel()}
          </div>
          <div className="level-info">
            <h3 style={{ margin: '0 0 4px 0' }}>{levelRequirements[getCurrentLevel()].name}</h3>
            <p style={{ margin: 0, color: '#666' }}>{userStats.totalPoints} points • {userStats.quizStreak} day streak</p>
          </div>
        </div>
        
        {timeLeft && (
          <div className="timer" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: timeLeft < 30 ? '#f44336' : '#333'
          }}>
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {/* Game Mode Selection */}
      <div className="game-modes" style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        <button
          className={`mode-btn ${gameMode === 'level' ? 'active' : ''}`}
          onClick={() => setGameMode('level')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 24px',
            border: '2px solid',
            borderColor: gameMode === 'level' ? '#2196F3' : '#ddd',
            borderRadius: '12px',
            backgroundColor: gameMode === 'level' ? '#e3f2fd' : '#fff',
            cursor: 'pointer'
          }}
        >
          <span className="mode-icon" style={{ fontSize: '24px' }}>📚</span>
          <span>Learn</span>
        </button>
        <button
          className={`mode-btn ${gameMode === 'daily' ? 'active' : ''}`}
          onClick={() => setGameMode('daily')}
          disabled={!canTakeDailyChallenge}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 24px',
            border: '2px solid',
            borderColor: gameMode === 'daily' ? '#2196F3' : '#ddd',
            borderRadius: '12px',
            backgroundColor: gameMode === 'daily' ? '#e3f2fd' : '#fff',
            cursor: canTakeDailyChallenge ? 'pointer' : 'not-allowed',
            opacity: canTakeDailyChallenge ? 1 : 0.5
          }}
        >
          <span className="mode-icon" style={{ fontSize: '24px' }}>🎯</span>
          <span>Daily Challenge</span>
          {!canTakeDailyChallenge && <small style={{ color: '#f44336' }}>Completed</small>}
        </button>
        <button
          className={`mode-btn ${gameMode === 'practice' ? 'active' : ''}`}
          onClick={() => setGameMode('practice')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 24px',
            border: '2px solid',
            borderColor: gameMode === 'practice' ? '#2196F3' : '#ddd',
            borderRadius: '12px',
            backgroundColor: gameMode === 'practice' ? '#e3f2fd' : '#fff',
            cursor: 'pointer'
          }}
        >
          <span className="mode-icon" style={{ fontSize: '24px' }}>⚡</span>
          <span>Practice</span>
        </button>
      </div>

      {/* Level Selection (only in level mode) */}
      {gameMode === 'level' && (
        <div className="level-selection" style={{ marginBottom: '24px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Choose Level</h3>
          <div className="levels-grid" style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center'
          }}>
            {[1, 2, 3].map(level => (
              <button
                key={level}
                className={`level-card ${currentLevel === level ? 'active' : ''} 
                  ${userStats.completedLevels.includes(level) ? 'completed' : ''}`}
                onClick={() => setCurrentLevel(level)}
                style={{
                  position: 'relative',
                  padding: '20px',
                  border: '2px solid',
                  borderColor: currentLevel === level ? '#2196F3' : '#ddd',
                  borderRadius: '12px',
                  backgroundColor: currentLevel === level ? '#e3f2fd' : '#fff',
                  cursor: 'pointer',
                  minWidth: '120px',
                  textAlign: 'center'
                }}
              >
                <div className="level-number" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{level}</div>
                <div className="level-name" style={{ fontSize: '14px', color: '#666' }}>
                  {level === 1 && 'Basic Knowledge'}
                  {level === 2 && 'Intermediate'}
                  {level === 3 && 'Advanced'}
                </div>
                {userStats.completedLevels.includes(level) && (
                  <div className="completion-badge" style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Interface */}
      {questions.length > 0 && (
        <div className="quiz-container" style={{ marginBottom: '24px' }}>
          <div className="quiz-progress" style={{ marginBottom: '16px' }}>
            <div className="progress-bar" style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#2196F3',
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            <span className="progress-text" style={{ fontSize: '14px', color: '#666' }}>
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>

          <div className="quiz-card" style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {renderQuestion()}
            
            {showExplanation && (
              <div className="explanation" style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <div className="explanation-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span className={selectedAnswer === questions[currentQuestion].correct || 
                    (questions[currentQuestion].type === 'true_false' && 
                     selectedAnswer === questions[currentQuestion].correct) ? 'correct' : 'incorrect'}
                    style={{
                      fontWeight: 'bold',
                      color: selectedAnswer === questions[currentQuestion].correct || 
                       (questions[currentQuestion].type === 'true_false' && 
                        selectedAnswer === questions[currentQuestion].correct) ? '#4CAF50' : '#f44336'
                    }}>
                    {selectedAnswer === questions[currentQuestion].correct || 
                     (questions[currentQuestion].type === 'true_false' && 
                      selectedAnswer === questions[currentQuestion].correct) ? '✓ Correct!' : '✗ Incorrect'}
                  </span>
                  <span className="points-earned" style={{ color: '#2196F3', fontWeight: 'bold' }}>
                    +{questions[currentQuestion].points} points
                  </span>
                </div>
                <p className="explanation-text" style={{ marginBottom: '16px' }}>
                  {questions[currentQuestion].explanation}
                </p>
                <button 
                  className="next-btn" 
                  onClick={nextQuestion}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="stats-dashboard" style={{ marginBottom: '24px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Your Progress</h3>
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          <div className="stat-item" style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <span className="stat-icon" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🏆</span>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {userStats.totalPoints}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>Total Points</span>
          </div>
          <div className="stat-item" style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <span className="stat-icon" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>✅</span>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {userStats.correctAnswers}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>Correct Answers</span>
          </div>
          <div className="stat-item" style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <span className="stat-icon" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🔥</span>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {userStats.quizStreak}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>Day Streak</span>
          </div>
          <div className="stat-item" style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <span className="stat-icon" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🎖️</span>
            <span className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {userStats.badges?.length || 0}
            </span>
            <span className="stat-label" style={{ fontSize: '14px', color: '#666' }}>Badges Earned</span>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      {userStats.badges && userStats.badges.length > 0 && (
        <div className="badges-section">
          <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Your Badges</h3>
          <div className="badges-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {userStats.badges.map(badgeId => {
              const badge = achievementBadges[badgeId];
              if (!badge) return null;
              return (
                <div key={badgeId} className="badge-card" style={{
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <span className="badge-icon" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
                    {badge.icon}
                  </span>
                  <h4 style={{ margin: '0 0 8px 0' }}>{badge.name}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;