import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Vibration,
} from 'react-native';

const { width } = Dimensions.get('window');

// Expanded color selection with more vibrant colors
const colors = [
  { name: "Red", value: "#FF3B30" },
  { name: "Blue", value: "#007AFF" },
  { name: "Green", value: "#34C759" },
  { name: "Yellow", value: "#FFCC00" },
  { name: "Purple", value: "#AF52DE" },
  { name: "Orange", value: "#FF9500" }
];

// Game phases
type GamePhase = 'welcome' | 'countdown' | 'playing' | 'finished';

export default function App() {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('welcome');
  const [countdown, setCountdown] = useState(3);
  const [gameTime, setGameTime] = useState(60); // Extended to 60 seconds
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentInkColor, setCurrentInkColor] = useState('');
  const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Start the countdown
  useEffect(() => {
    if (phase === 'countdown') {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            startGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Run the game timer when playing
  useEffect(() => {
    if (phase === 'playing') {
      // Reset progress animation
      progressAnim.setValue(0);
      
      // Animate progress bar over game duration
      Animated.timing(progressAnim, {
        toValue: width - 40, // Full width minus padding
        duration: gameTime * 1000,
        useNativeDriver: false,
      }).start();
      
      const gameInterval = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            clearInterval(gameInterval);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(gameInterval);
    }
  }, [phase, gameTime]);
  
  // Start the game
  const startGame = () => {
    setPhase('playing');
    setScore(0);
    setStreak(0);
    generateTrial();
  };
  
  // End the game
  const endGame = () => {
    setPhase('finished');
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
    }
    
    // Update best streak if needed
    if (streak > bestStreak) {
      setBestStreak(streak);
    }
    
    // Slide in the results screen
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Generate a new trial based on difficulty level
  const generateTrial = () => {
    let wordIndex = Math.floor(Math.random() * colors.length);
    let inkIndex = Math.floor(Math.random() * colors.length);
    
    // For medium difficulty, make sure word and ink are different 70% of the time
    if (difficulty === 'medium') {
      if (Math.random() < 0.7 && wordIndex === inkIndex) {
        inkIndex = (inkIndex + 1) % colors.length;
      }
    }
    
    // For hard difficulty, make sure word and ink are always different
    if (difficulty === 'hard') {
      while (wordIndex === inkIndex) {
        inkIndex = (inkIndex + 1) % colors.length;
      }
    }
    
    setCurrentWord(colors[wordIndex].name);
    setCurrentInkColor(colors[inkIndex].value);
    
    // Animate word appearance
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle the user's answer
  const handleAnswer = (selectedColor: string) => {
    if (phase !== 'playing') return;
    
    const isCorrect = selectedColor === currentInkColor;
    
    if (isCorrect) {
      // Correct answer
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setLastResult('correct');
      
      // Animate score increase
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Short vibration for correct answer
      Vibration.vibrate(50);
    } else {
      // Incorrect answer
      setLastResult('incorrect');
      setStreak(0);
      
      // Longer vibration for incorrect answer
      Vibration.vibrate(150);
    }
    
    // Move on to the next trial
    generateTrial();
  };

  // Restart the game
  const restartGame = () => {
    setPhase('countdown');
    setCountdown(3);
    setGameTime(difficulty === 'easy' ? 45 : difficulty === 'medium' ? 60 : 75);
    setScore(0);
    setStreak(0);
    setLastResult(null);
    setCurrentWord('');
    setCurrentInkColor('');
    
    // Reset animations
    slideAnim.setValue(0);
  };
  
  // Set difficulty and update game time accordingly
  const setGameDifficulty = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    
    // Adjust game time based on difficulty
    setGameTime(level === 'easy' ? 45 : level === 'medium' ? 60 : 75);
  };

  // Calculate accuracy percentage
  const getAccuracyPercentage = () => {
    return score > 0 ? Math.round((score / (score + streak)) * 100) : 0;
  };
  
  // Render welcome screen
  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.gameTitle}>STROOP TEST</Text>
      <Text style={styles.gameSubtitle}>Test your brain's processing speed</Text>
      
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>HOW TO PLAY</Text>
        <Text style={styles.instructionText}>
          • Choose the COLOR of the text, not what it says
        </Text>
        <Text style={styles.instructionText}>
          • Respond as quickly as possible
        </Text>
        <Text style={styles.instructionText}>
          • Build your streak for a higher score
        </Text>
      </View>
      
      <View style={styles.difficultySelector}>
        <Text style={styles.difficultyTitle}>DIFFICULTY</Text>
        <View style={styles.difficultyButtons}>
          <TouchableOpacity 
            style={[
              styles.difficultyButton, 
              difficulty === 'easy' && styles.selectedDifficulty,
              { backgroundColor: difficulty === 'easy' ? '#34C759' : 'rgba(52, 199, 89, 0.2)' }
            ]}
            onPress={() => setGameDifficulty('easy')}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === 'easy' && styles.selectedDifficultyText
            ]}>
              EASY
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.difficultyButton, 
              difficulty === 'medium' && styles.selectedDifficulty,
              { backgroundColor: difficulty === 'medium' ? '#FF9500' : 'rgba(255, 149, 0, 0.2)' }
            ]}
            onPress={() => setGameDifficulty('medium')}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === 'medium' && styles.selectedDifficultyText
            ]}>
              MEDIUM
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.difficultyButton, 
              difficulty === 'hard' && styles.selectedDifficulty,
              { backgroundColor: difficulty === 'hard' ? '#FF3B30' : 'rgba(255, 59, 48, 0.2)' }
            ]}
            onPress={() => setGameDifficulty('hard')}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === 'hard' && styles.selectedDifficultyText
            ]}>
              HARD
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {highScore > 0 && (
        <View style={styles.highScoreContainer}>
          <Text style={styles.highScoreLabel}>HIGH SCORE</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => setPhase('countdown')}
      >
        <Text style={styles.startButtonText}>START GAME</Text>
      </TouchableOpacity>
    </View>
  );

  // Render countdown screen
  const renderCountdown = () => (
    <View style={styles.countdownContainer}>
      <Text style={styles.countdownText}>{countdown}</Text>
      <Text style={styles.countdownLabel}>Get Ready!</Text>
    </View>
  );

  // Render playing screen
  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      <View style={styles.gameHeader}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>TIME</Text>
          <Text style={styles.timerValue}>{gameTime}s</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width: progressAnim }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <Animated.Text 
            style={[
              styles.scoreValue,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {score}
          </Animated.Text>
          <Text style={styles.scoreLabel}>SCORE</Text>
        </View>
      </View>
      
      {streak >= 3 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>{streak}🔥</Text>
        </View>
      )}
      
      <View style={styles.wordContainer}>
        <Animated.Text
          style={[
            styles.stroopWord, 
            { 
              color: currentInkColor,
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }]
            }
          ]}
        >
          {currentWord}
        </Animated.Text>
      </View>
      
      <Text style={styles.instruction}>
        Select the INK COLOR (not the word):
      </Text>
      
      <View style={styles.colorButtonsContainer}>
        {colors.map(color => (
          <TouchableOpacity
            key={color.name}
            style={[styles.colorButton, { backgroundColor: color.value }]}
            onPress={() => handleAnswer(color.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.colorButtonText}>{color.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {lastResult && (
        <View style={[
          styles.feedbackBadge,
          lastResult === 'correct' ? styles.correctBadge : styles.incorrectBadge
        ]}>
          <Text style={styles.feedbackText}>
            {lastResult === 'correct' ? '✓' : '✗'}
          </Text>
        </View>
      )}
    </View>
  );

  // Render finished screen
  const renderFinished = () => (
    <Animated.View 
      style={[
        styles.finishedContainer,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0]
              })
            }
          ]
        }
      ]}
    >
      <Text style={styles.finishedTitle}>GAME OVER</Text>
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{score}</Text>
            <Text style={styles.resultLabel}>FINAL SCORE</Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{bestStreak}</Text>
            <Text style={styles.resultLabel}>BEST STREAK</Text>
          </View>
        </View>
        
        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{score > highScore ? "NEW!" : highScore}</Text>
            <Text style={styles.resultLabel}>HIGH SCORE</Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{getAccuracyPercentage()}%</Text>
            <Text style={styles.resultLabel}>ACCURACY</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.playAgainButton]} 
          onPress={restartGame}
        >
          <Text style={styles.actionButtonText}>PLAY AGAIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.menuButton]} 
          onPress={() => setPhase('welcome')}
        >
          <Text style={styles.actionButtonText}>MAIN MENU</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {phase === 'welcome' && renderWelcome()}
      {phase === 'countdown' && renderCountdown()}
      {phase === 'playing' && renderPlaying()}
      {phase === 'finished' && renderFinished()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F7',
  },
  
  // Welcome screen styles
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  gameSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  instructionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    lineHeight: 22,
  },
  difficultySelector: {
    width: '100%',
    marginBottom: 30,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
    textAlign: 'center',
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    padding: 15,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDifficulty: {
    borderColor: '#1A1A1A',
  },
  difficultyText: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  selectedDifficultyText: {
    color: 'white',
  },
  highScoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  highScoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  highScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Countdown screen styles
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  countdownLabel: {
    fontSize: 24,
    color: '#666',
    marginTop: 20,
  },
  
  // Playing screen styles
  playingContainer: {
    flex: 1,
    padding: 20,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerContainer: {
    flex: 2,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  timerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  streakBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFCC00',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  wordContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stroopWord: {
    fontSize: 60,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  instruction: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  colorButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButton: {
    width: width / 3 - 20,
    height: 80,
    margin: 5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  colorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  feedbackBadge: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  correctBadge: {
    backgroundColor: '#34C759',
  },
  incorrectBadge: {
    backgroundColor: '#FF3B30',
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  
  // Finished screen styles
  finishedContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishedTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 30,
  },
  resultsContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  playAgainButton: {
    backgroundColor: '#007AFF',
  },
  menuButton: {
    backgroundColor: '#8E8E93',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});