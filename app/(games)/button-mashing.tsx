import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Vibration,
  Dimensions,
  StatusBar,
} from 'react-native';

type LeaderboardEntry = {
  id: number;
  score: number;
  date: string;
};

type Phase = 'welcome' | 'countdown' | 'playing' | 'results';

const { width, height } = Dimensions.get('window');
const GAME_DURATION = 10; // Increased from 7 to 10 seconds

const ButtonMashingGame: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [countdown, setCountdown] = useState<number>(3);
  const [pressCount, setPressCount] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [bestScore, setBestScore] = useState<number>(0);
  const [buttonScale] = useState(new Animated.Value(1));
  const [showingSquares, setShowingSquares] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  
  // Refs for animations
  const squaresRef = useRef<Animated.Value[]>([]);
  const opacityRef = useRef(new Animated.Value(0));
  const countTextRef = useRef(new Animated.Value(1));

  // Countdown timer for starting the game
  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setPhase('playing');
        setTimeLeft(GAME_DURATION);
      }
    }
  }, [countdown, phase]);

  // Time remaining counter for gameplay
  useEffect(() => {
    if (phase === 'playing') {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        finishGame();
      }
    }
  }, [timeLeft, phase]);

  // Finish the game and update leaderboard
  const finishGame = () => {
    const newEntry: LeaderboardEntry = {
      id: Date.now(),
      score: pressCount,
      date: new Date().toLocaleString(),
    };
    
    const newLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score);
    setLeaderboard(newLeaderboard);
    
    // Update best score if needed
    if (pressCount > bestScore) {
      setBestScore(pressCount);
    }
    
    setPhase('results');
    setSelectedEntry(newEntry);
    
    // Init square animation values
    initSquareAnimations(pressCount);
  };

  // Handle button press during gameplay
  const handlePress = () => {
    if (phase === 'playing') {
      setPressCount((prev) => prev + 1);
      
      // Animate button press
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.9,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animate count text
      Animated.sequence([
        Animated.timing(countTextRef.current, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(countTextRef.current, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Add haptic feedback
      Vibration.vibrate(10);
    }
  };

  // Initialize animations for squares in the leaderboard
  const initSquareAnimations = (count: number) => {
    // Create animated values for each square
    squaresRef.current = Array(count).fill(0).map(() => new Animated.Value(0));
    
    // Animate squares appearing
    setTimeout(() => {
      setShowingSquares(true);
      
      // Fade in container
      Animated.timing(opacityRef.current, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Animate each square with staggered delay
      squaresRef.current.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          easing: Easing.bounce,
          useNativeDriver: true,
        }).start();
      });
    }, 500);
  };

  // Handle entry selection in leaderboard
  const handleEntrySelect = (entry: LeaderboardEntry) => {
    if (selectedEntry?.id === entry.id) {
      setSelectedEntry(null);
      setShowingSquares(false);
    } else {
      setSelectedEntry(entry);
      initSquareAnimations(entry.score);
    }
  };

  // Start a new game
  const startGame = () => {
    setCountdown(3);
    setPressCount(0);
    setPhase('countdown');
    setShowingSquares(false);
    setSelectedEntry(null);
  };

  // Render animated squares
  const renderAnimatedSquares = (count: number) => {
    if (!showingSquares || squaresRef.current.length === 0) return null;
    
    const squares = [];
    const maxPerRow = 10;
    
    for (let i = 0; i < count; i++) {
      const rowIndex = Math.floor(i / maxPerRow);
      const colIndex = i % maxPerRow;
      
      squares.push(
        <Animated.View
          key={i}
          style={[
            styles.animatedSquare,
            {
              opacity: squaresRef.current[i],
              transform: [
                { scale: squaresRef.current[i] },
                { translateY: squaresRef.current[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}
              ],
              backgroundColor: getSquareColor(i / count),
              left: colIndex * 22,
              bottom: rowIndex * 22,
            }
          ]}
        />
      );
    }
    
    return (
      <Animated.View style={[styles.animatedSquaresContainer, { opacity: opacityRef.current }]}>
        {squares}
      </Animated.View>
    );
  };

  // Get color for square based on position
  const getSquareColor = (ratio: number) => {
    // Gradient from green to red
    const r = Math.round(255 * ratio);
    const g = Math.round(255 * (1 - ratio));
    return `rgb(${r}, ${g}, 100)`;
  };

  // Calculate press rate per second
  const calculatePressRate = (score: number) => {
    return (score / GAME_DURATION).toFixed(1);
  };

  // Welcome screen content
  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.gameTitle}>SPEED MASHER</Text>
      <Text style={styles.gameSubtitle}>How fast can you tap?</Text>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          Tap the button as fast as you can for {GAME_DURATION} seconds!
        </Text>
      </View>
      
      {bestScore > 0 && (
        <View style={styles.bestScoreContainer}>
          <Text style={styles.bestScoreLabel}>BEST SCORE</Text>
          <Text style={styles.bestScoreValue}>{bestScore}</Text>
          <Text style={styles.bestScoreRate}>
            {calculatePressRate(bestScore)} taps/second
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.startButton} 
        activeOpacity={0.7}
        onPress={startGame}
      >
        <Text style={styles.startButtonText}>START GAME</Text>
      </TouchableOpacity>

      {leaderboard.length > 0 && (
        <TouchableOpacity 
          style={styles.leaderboardButton} 
          activeOpacity={0.7}
          onPress={() => setPhase('results')}
        >
          <Text style={styles.leaderboardButtonText}>VIEW LEADERBOARD</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Countdown screen content
  const renderCountdown = () => (
    <View style={styles.countdownContainer}>
      <Text style={styles.countdownText}>{countdown}</Text>
      <Text style={styles.countdownSubtext}>
        {countdown > 0 ? 'GET READY!' : 'GO!'}
      </Text>
    </View>
  );

  // Gameplay screen content
  const renderPlaying = () => (
    <View style={styles.playingContainer}>
      <View style={styles.statsContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>TIME</Text>
          <Text style={[
            styles.timeValue, 
            timeLeft <= 3 ? styles.timeWarning : null
          ]}>
            {timeLeft}
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Animated.Text 
            style={[
              styles.scoreValue,
              { transform: [{ scale: countTextRef.current }] }
            ]}
          >
            {pressCount}
          </Animated.Text>
        </View>
      </View>
      
      <View style={styles.rateContainer}>
        <Text style={styles.rateLabel}>RATE</Text>
        <Text style={styles.rateValue}>
          {timeLeft < GAME_DURATION 
            ? calculatePressRate(pressCount) 
            : '0.0'} taps/sec
        </Text>
      </View>
      
      <Animated.View style={[
        styles.buttonContainer,
        { transform: [{ scale: buttonScale }] }
      ]}>
        <TouchableOpacity
          style={styles.mashButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.mashButtonText}>TAP!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // Results screen content
  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>LEADERBOARD</Text>
      
      <ScrollView style={styles.leaderboardScroll}>
        {leaderboard.map((entry, index) => (
          <TouchableOpacity
            key={entry.id}
            style={[
              styles.leaderboardEntry,
              selectedEntry?.id === entry.id && styles.selectedEntry
            ]}
            onPress={() => handleEntrySelect(entry)}
          >
            <Text style={styles.leaderboardRank}>#{index + 1}</Text>
            <View style={styles.leaderboardInfo}>
              <Text style={styles.leaderboardScore}>{entry.score}</Text>
              <Text style={styles.leaderboardDate}>{entry.date}</Text>
            </View>
            <Text style={styles.leaderboardRate}>
              {calculatePressRate(entry.score)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {selectedEntry && renderAnimatedSquares(selectedEntry.score)}
      
      <View style={styles.resultsButtonsContainer}>
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={startGame}
        >
          <Text style={styles.playAgainText}>PLAY AGAIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => setPhase('welcome')}
        >
          <Text style={styles.homeButtonText}>HOME</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render correct screen based on game phase
  const renderContent = () => {
    switch (phase) {
      case 'welcome':
        return renderWelcome();
      case 'countdown':
        return renderCountdown();
      case 'playing':
        return renderPlaying();
      case 'results':
        return renderResults();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
    color: '#FF4081',
    marginBottom: 10,
    textShadowColor: 'rgba(255, 64, 129, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gameSubtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    marginBottom: 40,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '90%',
  },
  instructionText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
  },
  bestScoreContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  bestScoreLabel: {
    fontSize: 14,
    color: '#AEEA00',
    marginBottom: 5,
  },
  bestScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#AEEA00',
    marginBottom: 5,
  },
  bestScoreRate: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  startButton: {
    backgroundColor: '#2979FF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leaderboardButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  leaderboardButtonText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  
  // Countdown screen styles
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  countdownSubtext: {
    fontSize: 24,
    color: '#E0E0E0',
    marginTop: 20,
  },
  
  // Gameplay screen styles
  playingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  timeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 10,
    minWidth: width * 0.4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#BDBDBD',
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeWarning: {
    color: '#FF5252',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 10,
    minWidth: width * 0.4,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#BDBDBD',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rateContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 10,
    minWidth: width * 0.8,
    marginTop: 20,
  },
  rateLabel: {
    fontSize: 14,
    color: '#BDBDBD',
    marginBottom: 5,
  },
  rateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#AEEA00',
  },
  buttonContainer: {
    marginTop: 40,
  },
  mashButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FF4081',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#FF4081',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  mashButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Results screen styles
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 20,
  },
  leaderboardScroll: {
    flex: 1,
    marginBottom: 220, // Space for the squares visualization
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  selectedEntry: {
    backgroundColor: 'rgba(41, 121, 255, 0.4)',
    borderColor: '#2979FF',
    borderWidth: 1,
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#BDBDBD',
    width: 40,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  leaderboardDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  leaderboardRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#AEEA00',
    width: 60,
    textAlign: 'right',
  },
  animatedSquaresContainer: {
    position: 'absolute',
    left: 20,
    bottom: 100,
    width: width - 40,
    height: 200,
  },
  animatedSquare: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 3,
  },
  resultsButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playAgainButton: {
    backgroundColor: '#2979FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexGrow: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  homeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexGrow: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 18,
    color: '#E0E0E0',
  },
});

export default ButtonMashingGame;