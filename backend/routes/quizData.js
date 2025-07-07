// quizData.js - Educational quiz questions for beach cleanup volunteers

export const quizQuestions = {
  // Level 1: Basic Waste Segregation
  level1: [
    {
      id: 1,
      type: 'multiple_choice',
      difficulty: 'easy',
      category: 'waste_segregation',
      question: 'Which bin should plastic bottles go into?',
      options: ['Organic Waste', 'Recyclable Waste', 'Hazardous Waste', 'General Waste'],
      correct: 1,
      explanation: 'Plastic bottles are recyclable and should go into the recyclable waste bin to be processed and reused.',
      points: 10,
      image: null
    },
    {
      id: 2,
      type: 'true_false',
      difficulty: 'easy',
      category: 'beach_cleanup',
      question: 'It\'s safe to pick up broken glass with bare hands during beach cleanup.',
      correct: false,
      explanation: 'Never pick up broken glass with bare hands. Always use gloves and proper tools to avoid injury.',
      points: 10,
      image: null
    },
    {
      id: 3,
      type: 'multiple_choice',
      difficulty: 'easy',
      category: 'environmental_impact',
      question: 'How long does it take for a plastic bag to decompose in nature?',
      options: ['1 year', '10 years', '100 years', '500+ years'],
      correct: 3,
      explanation: 'Plastic bags can take 500-1000 years to decompose, making them extremely harmful to the environment.',
      points: 10,
      image: null
    },
    {
      id: 4,
      type: 'drag_drop',
      difficulty: 'easy',
      category: 'waste_segregation',
      question: 'Sort these items into the correct waste categories:',
      items: ['Banana Peel', 'Aluminum Can', 'Battery', 'Newspaper'],
      categories: ['Organic', 'Recyclable', 'Hazardous', 'Paper'],
      correct: [0, 1, 2, 3], // indices matching items to categories
      explanation: 'Proper segregation helps in efficient waste management and recycling processes.',
      points: 15,
      image: null
    }
  ],

  // Level 2: Intermediate Knowledge
  level2: [
    {
      id: 5,
      type: 'multiple_choice',
      difficulty: 'medium',
      category: 'marine_life',
      question: 'Which marine animal is most commonly affected by plastic straws?',
      options: ['Dolphins', 'Sea Turtles', 'Whales', 'Fish'],
      correct: 1,
      explanation: 'Sea turtles often mistake plastic straws for food, leading to serious health issues and death.',
      points: 15,
      image: null
    },
    {
      id: 6,
      type: 'fill_blank',
      difficulty: 'medium',
      category: 'statistics',
      question: 'Approximately _____ million tons of plastic waste enters our oceans every year.',
      correct: ['8', 'eight'],
      explanation: 'About 8 million tons of plastic waste enters our oceans annually, equivalent to dumping a garbage truck of plastic every minute.',
      points: 15,
      image: null
    },
    {
      id: 7,
      type: 'multiple_choice',
      difficulty: 'medium',
      category: 'cleanup_techniques',
      question: 'What is the most effective way to remove microplastics from beach sand?',
      options: ['Using fine mesh sieves', 'Manual picking', 'Water washing', 'Magnetic separation'],
      correct: 0,
      explanation: 'Fine mesh sieves can effectively separate microplastics from sand particles based on size differences.',
      points: 15,
      image: null
    },
    {
      id: 8,
      type: 'sequence',
      difficulty: 'medium',
      category: 'cleanup_process',
      question: 'Arrange the beach cleanup process in the correct order:',
      items: ['Data Recording', 'Safety Briefing', 'Waste Collection', 'Waste Sorting', 'Site Assessment'],
      correct: [4, 1, 2, 3, 0], // Site Assessment, Safety Briefing, Waste Collection, Waste Sorting, Data Recording
      explanation: 'Following the proper sequence ensures safety and maximizes cleanup effectiveness.',
      points: 20,
      image: null
    }
  ],

  // Level 3: Advanced Environmental Knowledge
  level3: [
    {
      id: 9,
      type: 'multiple_choice',
      difficulty: 'hard',
      category: 'policy',
      question: 'Which international agreement addresses marine plastic pollution?',
      options: ['Paris Agreement', 'Basel Convention', 'Montreal Protocol', 'MARPOL Convention'],
      correct: 3,
      explanation: 'MARPOL (Marine Pollution) Convention is the main international agreement preventing pollution from ships, including plastic waste.',
      points: 20,
      image: null
    },
    {
      id: 10,
      type: 'multiple_select',
      difficulty: 'hard',
      category: 'ngo_knowledge',
      question: 'Which of these are major NGOs working on ocean conservation? (Select all that apply)',
      options: ['Ocean Conservancy', 'Surfrider Foundation', 'Greenpeace', 'Red Cross'],
      correct: [0, 1, 2], // Ocean Conservancy, Surfrider Foundation, Greenpeace
      explanation: 'Ocean Conservancy, Surfrider Foundation, and Greenpeace are all major NGOs working on ocean and marine conservation.',
      points: 25,
      image: null
    },
    {
      id: 11,
      type: 'case_study',
      difficulty: 'hard',
      category: 'problem_solving',
      question: 'A beach cleanup team finds oil-contaminated debris. What should be the immediate action?',
      scenario: 'During a routine beach cleanup, volunteers discover debris covered in oil along a 100-meter stretch of coastline.',
      options: [
        'Continue cleanup with regular gloves',
        'Stop cleanup and contact authorities',
        'Use detergent to clean the oil',
        'Bury the contaminated debris'
      ],
      correct: 1,
      explanation: 'Oil contamination requires specialized handling. Authorities must be contacted immediately as this could indicate a larger environmental incident.',
      points: 25,
      image: null
    }
  ],

  // Daily Challenge Questions
  dailyChallenges: [
    {
      id: 'daily_1',
      type: 'photo_challenge',
      difficulty: 'easy',
      category: 'real_world',
      question: 'Take a photo of proper waste segregation in your area',
      description: 'Find an example of good waste segregation practice and capture it. This could be properly sorted bins, recycling stations, or composting areas.',
      points: 30,
      timeLimit: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      verification: 'manual' // requires manual verification
    },
    {
      id: 'daily_2',
      type: 'action_challenge',
      difficulty: 'medium',
      category: 'personal_action',
      question: 'Avoid single-use plastics for an entire day',
      description: 'Go through one full day without using any single-use plastic items. Document your experience and share tips.',
      points: 50,
      timeLimit: 24 * 60 * 60 * 1000,
      verification: 'self_report'
    },
    {
      id: 'daily_3',
      type: 'knowledge_sprint',
      difficulty: 'hard',
      category: 'rapid_fire',
      question: 'Complete 10 questions in 2 minutes',
      description: 'Test your knowledge with a rapid-fire round of environmental questions.',
      points: 40,
      timeLimit: 2 * 60 * 1000, // 2 minutes
      verification: 'automatic'
    }
  ]
};

export const achievementBadges = {
  quiz_rookie: {
    name: 'Quiz Rookie',
    description: 'Complete your first quiz',
    icon: '🎯',
    requirement: 'complete_first_quiz'
  },
  knowledge_seeker: {
    name: 'Knowledge Seeker',
    description: 'Answer 50 questions correctly',
    icon: '📚',
    requirement: 'correct_answers_50'
  },
  streak_master: {
    name: 'Streak Master',
    description: 'Maintain a 7-day quiz streak',
    icon: '🔥',
    requirement: 'quiz_streak_7'
  },
  perfect_score: {
    name: 'Perfect Score',
    description: 'Get 100% on a level',
    icon: '⭐',
    requirement: 'perfect_level_score'
  },
  eco_expert: {
    name: 'Eco Expert',
    description: 'Complete all advanced level questions',
    icon: '🌟',
    requirement: 'complete_level_3'
  },
  daily_warrior: {
    name: 'Daily Warrior',
    description: 'Complete 30 daily challenges',
    icon: '⚔️',
    requirement: 'daily_challenges_30'
  },
  marine_guardian: {
    name: 'Marine Guardian',
    description: 'Master all marine life questions',
    icon: '🐠',
    requirement: 'marine_life_master'
  },
  waste_wizard: {
    name: 'Waste Wizard',
    description: 'Perfect score on all waste segregation questions',
    icon: '🧙‍♂️',
    requirement: 'waste_segregation_master'
  }
};

export const levelRequirements = {
  1: { minPoints: 0, name: 'Eco Beginner', color: '#4CAF50' },
  2: { minPoints: 100, name: 'Beach Buddy', color: '#2196F3' },
  3: { minPoints: 250, name: 'Clean Crusader', color: '#9C27B0' },
  4: { minPoints: 500, name: 'Waste Warrior', color: '#FF9800' },
  5: { minPoints: 750, name: 'Ocean Guardian', color: '#F44336' },
  6: { minPoints: 1000, name: 'Eco Expert', color: '#795548' },
  7: { minPoints: 1500, name: 'Marine Master', color: '#607D8B' },
  8: { minPoints: 2000, name: 'Planet Protector', color: '#E91E63' },
  9: { minPoints: 3000, name: 'Sustainability Sage', color: '#3F51B5' },
  10: { minPoints: 5000, name: 'Environmental Legend', color: '#FFD700' }
};