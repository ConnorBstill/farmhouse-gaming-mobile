import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  Alert,
  ScrollView,
} from 'react-native';

// The 7 fixed letters (includes 3 vowels: A, E, I)
const ALLOWED_LETTERS = ["A", "E", "I", "R", "T", "L", "S"];

// A small dictionary of valid words (all uppercase) that can be made with the allowed letters.
const DICTIONARY = new Set([
  "ART", "TAR", "RAT", "STAR", "TSAR", "TEAR", "RATE", "TIER",
  "LATE", "REAL", "TAIL", "LIST", "SALT", "RAIL", "ALERT", "ALTER",
  "LATER", "STARE", "RETAIL", "SLATE", "TRAIL", "ISLE", "SIRE",
  "LIT", "LET", "SET", "SIR", "ITS", "TASTE", "EAST", "SEAT", "TEAL", "LEAST"
]);

// Leaderboard entry type.
type LeaderboardEntry = {
  id: number;
  score: number;
  words: string[];
};

export default function App() {
  // Game states: "countdown", "playing", or "finished"
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [gameTime, setGameTime] = useState<number>(30);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  // Timer for gameplay.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('finished');
            // Add current score to the leaderboard.
            const newEntry: LeaderboardEntry = {
              id: Date.now(),
              score,
              words: submittedWords,
            };
            setLeaderboard(prevLeaderboard => [...prevLeaderboard, newEntry]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, score, submittedWords]);
  
  // Countdown effect.
  useEffect(() => {
    if (gameState === 'countdown') {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);
  
  // Checks if a word is valid:
  // 1. It must have at least 2 letters.
  // 2. All its letters must come from ALLOWED_LETTERS.
  // 3. The word is found in our dictionary.
  // 4. It has not already been submitted.
  const isValidWord = (word: string): boolean => {
    if (word.length < 2) return false;
    // All letters must be in ALLOWED_LETTERS.
    for (let letter of word) {
      if (!ALLOWED_LETTERS.includes(letter)) {
        return false;
      }
    }
    // Word must exist in our dictionary.
    if (!DICTIONARY.has(word)) {
      return false;
    }
    // Do not allow duplicate submissions.
    if (submittedWords.includes(word)) {
      return false;
    }
    return true;
  };
  
  // Handle when the player taps a letter button.
  const handleLetterPress = (letter: string) => {
    setCurrentWord(prev => prev + letter);
  };

  // Clear the current word.
  const handleClear = () => {
    setCurrentWord('');
  };

  // Submit the current word.
  const handleSubmitWord = () => {
    const word = currentWord.toUpperCase();
    if (!isValidWord(word)) {
      Alert.alert("Invalid word", "Either the word is too short, not in our dictionary, or has already been used.");
      setCurrentWord('');
      return;
    }
    // Increase score by the length of the word.
    setScore(prev => prev + word.length);
    setSubmittedWords(prev => [...prev, word]);
    setCurrentWord('');
  };

  // Restart the game.
  const handleRestart = () => {
    setGameState('countdown');
    setCountdown(3);
    setGameTime(30);
    setCurrentWord('');
    setSubmittedWords([]);
    setScore(0);
  };

  // Render the letter buttons.
  const renderLetters = () => {
    return (
      <View style={styles.lettersContainer}>
        {ALLOWED_LETTERS.map(letter => (
          <TouchableOpacity
            key={letter}
            style={styles.letterButton}
            onPress={() => handleLetterPress(letter)}
          >
            <Text style={styles.letterText}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render the list of submitted words.
  const renderSubmittedWords = () => {
    return (
      <ScrollView style={styles.wordsList}>
        {submittedWords.map((word, index) => (
          <Text key={index} style={styles.submittedWord}>
            {word} ({word.length})
          </Text>
        ))}
      </ScrollView>
    );
  };

  // Render leaderboard (sorted by highest score).
  const renderLeaderboard = () => {
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
    return (
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        {sortedLeaderboard.map((entry, index) => (
          <Text key={entry.id} style={styles.leaderboardEntry}>
            {index + 1}. {entry.score} pts
          </Text>
        ))}
        <Button title="Play Again" onPress={handleRestart} />
      </View>
    );
  };

  // Main content rendering.
  const renderContent = () => {
    if (gameState === 'countdown') {
      return (
        <View style={styles.centered}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      );
    } else if (gameState === 'playing') {
      return (
        <View style={styles.container}>
          <Text style={styles.timerText}>Time Left: {gameTime}s</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <View style={styles.currentWordContainer}>
            <Text style={styles.currentWordText}>{currentWord}</Text>
          </View>
          {renderLetters()}
          <View style={styles.buttonRow}>
            <Button title="Clear" onPress={handleClear} />
            <Button title="Submit" onPress={handleSubmitWord} />
          </View>
          <Text style={styles.wordsTitle}>Submitted Words:</Text>
          {renderSubmittedWords()}
        </View>
      );
    } else if (gameState === 'finished') {
      return (
        <View style={styles.centered}>
          <Text style={styles.finalText}>Time's Up! Your Score: {score}</Text>
          {renderLeaderboard()}
        </View>
      );
    }
  };

  return <View style={styles.mainContainer}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f9f9f9',
  },
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  currentWordContainer: {
    borderWidth: 1,
    borderColor: '#333',
    marginVertical: 10,
    padding: 10,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  currentWordText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  lettersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  letterButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  letterText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  wordsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  wordsList: {
    marginTop: 10,
    maxHeight: 100,
  },
  submittedWord: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 2,
  },
  leaderboardContainer: {
    width: '80%',
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  leaderboardEntry: {
    fontSize: 20,
    marginVertical: 3,
  },
  finalText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});

