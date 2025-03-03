import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  ImageBackground,
  Animated,
  Vibration,
  SafeAreaView
} from 'react-native';

const { width, height } = Dimensions.get('window');

type LeaderboardEntry = {
  id: number;
  score: number;
};

// Create an array of possible target colors for variety
const TARGET_COLORS = ['#FF4136', '#FF851B', '#FFDC00', '#2ECC40', '#0074D9', '#B10DC9'];

// Get random position for the target
const getRandomPosition = () => {
  const targetSize = 60; // Slightly larger target
  const x = Math.random() * (width - targetSize);
  const y = Math.random() * (height - targetSize - 150) + 100; // More room for header
  return { x, y };
};

// Get random color for the target
const getRandomColor = () => {
  return TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)];
};

export default function App() {
  // Game phases: "welcome" -> "countdown" -> "playing" -> "finished"
  const [gamePhase, setGamePhase] = useState<'welcome' | 'countdown' | 'playing' | 'finished'>('welcome');
  const [countdown, setCountdown] = useState<number>(3);
  const [gameTime, setGameTime] = useState<number>(30); // Increased game time to 30 seconds
  const [score, setScore] = useState<number>(0);
  const [targetPosition, setTargetPosition] = useState(getRandomPosition());
  const [targetColor, setTargetColor] = useState(getRandomColor());
  const [targetSize] = useState(new Animated.Value(60));
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [bestScore, setBestScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [showComboText, setShowComboText] = useState<boolean>(false);

  // Countdown timer
  useEffect(() => {
    if (gamePhase === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGamePhase('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gamePhase]);

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gamePhase === 'playing') {
      timer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gamePhase]);

  // Finish game and update leaderboard
  const finishGame = () => {
    setGamePhase('finished');
    const newEntry: LeaderboardEntry = { id: Date.now(), score };
    setLeaderboard(prev => [...prev, newEntry]);
    
    // Update best score
    if (score > bestScore) {
      setBestScore(score);
    }
  };

  // Animate the target when tapped
  const animateTarget = () => {
    Animated.sequence([
      Animated.timing(targetSize, {
        toValue: 70,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(targetSize, {
        toValue: 60,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Handle target tap
  const handleTargetPress = () => {
    if (gamePhase !== 'playing') return;
    
    // Increase score and combo
    setScore(prev => prev + 1);
    setCombo(prev => prev + 1);
    
    // Show combo text for high combos
    if (combo >= 2) {
      setShowComboText(true);
      setTimeout(() => setShowComboText(false), 800);
    }
    
    // Short vibration for haptic feedback
    Vibration.vibrate(20);
    
    // Animate target
    animateTarget();
    
    // Change target position and color
    setTargetPosition(getRandomPosition());
    setTargetColor(getRandomColor());
  };

  // Start the game
  const handleStartGame = () => {
    setGamePhase('countdown');
    setCountdown(3);
    setGameTime(30);
    setScore(0);
    setCombo(0);
    setTargetPosition(getRandomPosition());
    setTargetColor(getRandomColor());
  };

  // Restart the game
  const handleRestart = () => {
    handleStartGame();
  };

  // Render welcome screen
  const renderWelcome = () => {
    return (
      <View style={[styles.centered, styles.gradientBackground]}>
        <Text style={styles.titleText}>SPEED TAP</Text>
        <Text style={styles.instructionText}>Tap as many targets as you can in 30 seconds!</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.bestScoreText}>Best Score: {bestScore}</Text>
        </View>
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handleStartGame}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render countdown screen
  const renderCountdown = () => {
    return (
      <View style={[styles.centered, styles.gradientBackground]}>
        <Text style={styles.countdownText}>{countdown}</Text>
        <Text style={styles.getReadyText}>Get Ready!</Text>
      </View>
    );
  };

  // Render gameplay screen
  const renderPlaying = () => {
    return (
      <ImageBackground 
        source={{ uri: 'https://example.com/placeholder-bg.jpg' }} 
        style={styles.gameContainer}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={styles.headerContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.labelText}>TIME</Text>
            <Text style={styles.timerText}>{gameTime}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.labelText}>SCORE</Text>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>

        {showComboText && combo > 2 && (
          <View style={styles.comboContainer}>
            <Text style={styles.comboText}>{combo}x COMBO!</Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.target,
            { 
              left: targetPosition.x, 
              top: targetPosition.y,
              backgroundColor: targetColor,
              width: targetSize,
              height: targetSize,
              borderRadius: Animated.divide(targetSize, 2) as any,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.targetTouchable}
            onPress={handleTargetPress}
            activeOpacity={0.7}
          />
        </Animated.View>
      </ImageBackground>
    );
  };

  // Render finished screen
  const renderFinished = () => {
    // Sort leaderboard by score
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 5);
    const isNewBest = score === bestScore && score > 0;

    return (
      <View style={[styles.centered, styles.gradientBackground]}>
        <Text style={styles.gameOverText}>GAME OVER</Text>
        <Text style={styles.finalScore}>Your Score: {score}</Text>
        
        {isNewBest && (
          <View style={styles.newBestContainer}>
            <Text style={styles.newBestText}>NEW BEST SCORE!</Text>
          </View>
        )}
        
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>TOP SCORES</Text>
          {sortedLeaderboard.map((entry, index) => (
            <View key={entry.id} style={styles.leaderboardRow}>
              <Text style={styles.leaderboardRank}>{index + 1}</Text>
              <Text style={styles.leaderboardScore}>{entry.score}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.playAgainButton} 
          onPress={handleRestart}
          activeOpacity={0.8}
        >
          <Text style={styles.playAgainText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render content based on game phase
  const renderContent = () => {
    switch (gamePhase) {
      case 'welcome':
        return renderWelcome();
      case 'countdown':
        return renderCountdown();
      case 'playing':
        return renderPlaying();
      case 'finished':
        return renderFinished();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradientBackground: {
    backgroundColor: '#192f6a',
  },
  titleText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  instructionText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    marginBottom: 40,
  },
  bestScoreText: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#2ECC40',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#fff',
  },
  getReadyText: {
    fontSize: 24,
    color: '#fff',
    marginTop: 20,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  timeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  labelText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4136',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ECC40',
  },
  target: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  targetTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  comboContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  comboText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameOverText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF4136',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  finalScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  newBestContainer: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 30,
    transform: [{ rotate: '-5deg' }],
  },
  newBestText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  leaderboardContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 15,
    width: '80%',
    marginBottom: 30,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ccc',
    width: 30,
  },
  leaderboardScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC40',
  },
  playAgainButton: {
    backgroundColor: '#0074D9',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  playAgainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});