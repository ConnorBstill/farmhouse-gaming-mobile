import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
type GameState = 'countdown' | 'playing' | 'finished';
type RoundData = {
  targetEmoji: string;
  gridEmojis: string[];
  startTime: number;
  endTime: number | null;
};

interface LeaderboardEntry {
  name: string;
  totalTime: number;
  date: string;
}

// Constants
const GRID_SIZE = 24;
const NUM_ROUNDS = 3;
const COUNTDOWN_SECONDS = 3;

// Emoji sets - all matching the same general theme/color
const emojiSets = [
  { target: '🦊', decoy: '🦝' }, // orange animals
  { target: '🍊', decoy: '🍋' }, // yellow/orange fruits
  { target: '🧡', decoy: '💛' }, // hearts
  { target: '🐙', decoy: '🦑' }, // sea creatures
  { target: '🦀', decoy: '🦞' }, // red crustaceans
  { target: '👻', decoy: '💭' }, // white things
  { target: '🍩', decoy: '🥯' }, // round food
  { target: '🥝', decoy: '🥑' }, // green foods
];

const App = () => {
  const [gameState, setGameState] = useState<GameState>('countdown');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize game
  useEffect(() => {
    startGame();
    loadLeaderboard();
    
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const loadLeaderboard = async () => {
    try {
      const storedLeaderboard = await AsyncStorage.getItem('leaderboard');
      if (storedLeaderboard) {
        setLeaderboard(JSON.parse(storedLeaderboard));
      }
    } catch (error) {
      console.error('Failed to load leaderboard', error);
    }
  };

  const saveLeaderboard = async (updatedLeaderboard: LeaderboardEntry[]) => {
    try {
      await AsyncStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
    } catch (error) {
      console.error('Failed to save leaderboard', error);
    }
  };

  const startGame = () => {
    setGameState('countdown');
    setCountdown(COUNTDOWN_SECONDS);
    setCurrentRound(0);
    setRounds([]);
    startCountdown();
  };

  const startCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          prepareRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const prepareRound = () => {
    // Choose a random emoji set
    const randomSetIndex = Math.floor(Math.random() * emojiSets.length);
    const { target, decoy } = emojiSets[randomSetIndex];
    
    // Create grid with decoy emojis
    const gridEmojis = Array(GRID_SIZE).fill(decoy);
    
    // Place target emoji at random position
    const targetPosition = Math.floor(Math.random() * GRID_SIZE);
    gridEmojis[targetPosition] = target;
    
    // Add new round
    const newRound: RoundData = {
      targetEmoji: target,
      gridEmojis,
      startTime: Date.now(),
      endTime: null,
    };
    
    setRounds((prevRounds) => [...prevRounds, newRound]);
    setGameState('playing');
  };

  const handleEmojiPress = (index: number) => {
    if (gameState !== 'playing') return;
    
    const currentRoundData = rounds[currentRound];
    const isCorrect = currentRoundData.gridEmojis[index] === currentRoundData.targetEmoji;
    
    if (isCorrect) {
      // Update round with end time
      const updatedRounds = [...rounds];
      updatedRounds[currentRound] = {
        ...updatedRounds[currentRound],
        endTime: Date.now(),
      };
      setRounds(updatedRounds);
      
      // Move to next round or finish game
      if (currentRound < NUM_ROUNDS - 1) {
        setCurrentRound((prev) => prev + 1);
        setTimeout(prepareRound, 500);
      } else {
        finishGame(updatedRounds);
      }
    }
  };

  const finishGame = (completedRounds: RoundData[]) => {
    setGameState('finished');
    
    // Calculate total time
    const totalTime = completedRounds.reduce((sum, round) => {
      if (round.endTime) {
        return sum + (round.endTime - round.startTime);
      }
      return sum;
    }, 0);
    
    // Ask for player name if not already entered
    if (!nameEntered) {
      Alert.prompt(
        'Game Complete!',
        `Your total time: ${(totalTime / 1000).toFixed(2)} seconds. Enter your name:`,
        [
          {
            text: 'Submit',
            onPress: (name = 'Anonymous') => {
              setPlayerName(name);
              setNameEntered(true);
              updateLeaderboard(name, totalTime);
            },
          },
        ],
        'plain-text'
      );
    } else {
      updateLeaderboard(playerName, totalTime);
    }
  };

  const updateLeaderboard = (name: string, totalTime: number) => {
    const newEntry: LeaderboardEntry = {
      name,
      totalTime,
      date: new Date().toLocaleDateString(),
    };
    
    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => a.totalTime - b.totalTime).slice(0, 10);
    setLeaderboard(updatedLeaderboard);
    saveLeaderboard(updatedLeaderboard);
  };

  const renderGameContent = () => {
    if (gameState === 'countdown') {
      return (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
          <Text style={styles.instructionText}>Get ready to find the emoji!</Text>
        </View>
      );
    } else if (gameState === 'playing') {
      const currentRoundData = rounds[currentRound];
      
      if (!currentRoundData) return null;
      
      return (
        <View style={styles.gameContainer}>
          <Text style={styles.roundText}>Round {currentRound + 1}/{NUM_ROUNDS}</Text>
          <Text style={styles.targetText}>
            Find <Text style={styles.targetEmoji}>{currentRoundData.targetEmoji}</Text>
          </Text>
          
          <View style={styles.grid}>
            {currentRoundData.gridEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiBox}
                onPress={() => handleEmojiPress(index)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else if (gameState === 'finished') {
      const totalTime = rounds.reduce((sum, round) => {
        if (round.endTime) {
          return sum + (round.endTime - round.startTime);
        }
        return sum;
      }, 0);
      
      return (
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          <Text style={styles.scoreText}>
            Your time: {(totalTime / 1000).toFixed(2)} seconds
          </Text>
          
          <ScrollView style={styles.leaderboardList}>
            {leaderboard.map((entry, index) => (
              <View key={index} style={styles.leaderboardItem}>
                <Text style={styles.leaderboardRank}>{index + 1}</Text>
                <Text style={styles.leaderboardName}>{entry.name}</Text>
                <Text style={styles.leaderboardTime}>
                  {(entry.totalTime / 1000).toFixed(2)}s
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Emoji Finder</Text>
      {renderGameContent()}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const gridWidth = Math.min(width - 40, 400);
const itemSize = gridWidth / Math.sqrt(GRID_SIZE);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 18,
    marginTop: 20,
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  roundText: {
    fontSize: 18,
    marginBottom: 10,
  },
  targetText: {
    fontSize: 24,
    marginBottom: 20,
  },
  targetEmoji: {
    fontSize: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: gridWidth,
    height: gridWidth,
    justifyContent: 'center',
  },
  emojiBox: {
    width: itemSize,
    height: itemSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  emoji: {
    fontSize: 24,
  },
  leaderboardContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 20,
  },
  leaderboardList: {
    width: '100%',
    maxHeight: 300,
  },
  leaderboardItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  leaderboardRank: {
    width: 30,
    fontWeight: 'bold',
  },
  leaderboardName: {
    flex: 1,
  },
  leaderboardTime: {
    width: 80,
    textAlign: 'right',
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;