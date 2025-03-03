import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from 'react-native';

// --- Constants & Types ---
type GameState = 'countdown' | 'playing' | 'finished';

type LeaderboardEntry = {
  id: number;
  score: number;
  words: string[];
};

// In this game the user is given a letter and must come up with as many words as possible
// that start with that letter. Here we simulate a computer player's answers with a small sample.
const getRandomLetter = (): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return alphabet[Math.floor(Math.random() * alphabet.length)];
};

const getComputerWords = (letter: string): string[] => {
  // A small sample dictionary for computer words; extend as needed.
  const sample: Record<string, string[]> = {
    A: ['APPLE', 'ANT', 'AXIS', 'AREA'],
    B: ['BALL', 'BAT', 'BARN', 'BEEP'],
    C: ['CAT', 'CAR', 'CUP', 'CAVE'],
    D: ['DOG', 'DOVE', 'DRUM', 'DEAL'],
    E: ['ECHO', 'EGG', 'EAR', 'EDGE'],
    F: ['FAN', 'FISH', 'FROG', 'FARM'],
    // ... add additional letters as needed.
  };
  return sample[letter] || [letter + 'WORD', letter + 'TEST'];
};

// --- Main App ---
export default function App() {
  // Game state variables.
  const [gameState, setGameState] = useState<GameState>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [gameTime, setGameTime] = useState<number>(30);
  const [chosenLetter, setChosenLetter] = useState<string>('');
  const [currentInput, setCurrentInput] = useState<string>('');
  const [userWords, setUserWords] = useState<string[]>([]);
  const [computerWords, setComputerWordsState] = useState<string[]>([]);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // --- Countdown Effect ---
  useEffect(() => {
    if (gameState === 'countdown') {
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // When countdown finishes, choose a random letter and start playing.
            const letter = getRandomLetter();
            setChosenLetter(letter);
            setGameState('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [gameState]);

  // --- Game Timer Effect ---
  useEffect(() => {
    let gameTimer: NodeJS.Timeout;
    if (gameState === 'playing') {
      gameTimer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            clearInterval(gameTimer);
            setGameState('finished');
            // When time is up, get the computer words.
            const compWords = getComputerWords(chosenLetter);
            setComputerWordsState(compWords);
            // Compute final score: only count user words that do NOT appear in the computer words.
            const validWords = userWords.filter(
              word => !compWords.includes(word.toUpperCase())
            );
            const score = validWords.reduce((sum, word) => sum + word.length, 0);
            setFinalScore(score);
            // Add this game to the leaderboard.
            const newEntry: LeaderboardEntry = {
              id: Date.now(),
              score,
              words: userWords,
            };
            setLeaderboard(prev => [...prev, newEntry]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(gameTimer);
    }
  }, [gameState, chosenLetter, userWords]);

  // --- Word Submission ---
  // Valid if the word is at least 2 letters, starts with the chosen letter, and isn’t already submitted.
  const isValidWord = (word: string): boolean => {
    if (word.length < 2) return false;
    if (word[0] !== chosenLetter) return false;
    if (userWords.includes(word.toUpperCase())) return false;
    return true;
  };

  const handleSubmitWord = () => {
    const word = currentInput.trim().toUpperCase();
    if (!isValidWord(word)) {
      Alert.alert(
        'Invalid Word',
        `Word must be at least 2 letters, start with "${chosenLetter}", and not already submitted.`
      );
      setCurrentInput('');
      return;
    }
    setUserWords(prev => [...prev, word]);
    setCurrentInput('');
  };

  // --- Restart Game ---
  const handleRestart = () => {
    setGameState('countdown');
    setCountdown(3);
    setGameTime(30);
    setChosenLetter('');
    setCurrentInput('');
    setUserWords([]);
    setComputerWordsState([]);
    setFinalScore(0);
  };

  // --- Rendering Functions ---

  // Render the game view during play.
  const renderGameView = () => (
    <View style={styles.gameContainer}>
      <Text style={styles.timerText}>Time Left: {gameTime}s</Text>
      <Text style={styles.letterText}>Your Letter: {chosenLetter}</Text>
      <Text style={styles.instructions}>
        Enter as many words starting with "{chosenLetter}" as you can.
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={currentInput}
          onChangeText={setCurrentInput}
          placeholder="Type word here"
          autoCapitalize="characters"
        />
        <Button title="Add Word" onPress={handleSubmitWord} />
      </View>
      <Text style={styles.submittedTitle}>Your Words:</Text>
      <ScrollView style={styles.wordsList}>
        {userWords.map((word, index) => (
          <Text key={index} style={styles.wordItem}>
            {word} ({word.length})
          </Text>
        ))}
      </ScrollView>
    </View>
  );

  // Render the leaderboard showing each entry's score and the list of words.
  const renderLeaderboard = () => {
    const sortedBoard = [...leaderboard].sort((a, b) => b.score - a.score);
    return (
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        {sortedBoard.map((entry, index) => (
          <View key={entry.id} style={styles.leaderboardEntryContainer}>
            <Text style={styles.leaderboardEntryText}>
              {index + 1}. {entry.score} pts
            </Text>
            <Text style={styles.leaderboardWords}>
              {entry.words.join(', ')}
            </Text>
          </View>
        ))}
        <Button title="Play Again" onPress={handleRestart} />
      </View>
    );
  };

  // Render content based on game state.
  const renderContent = () => {
    if (gameState === 'countdown') {
      return (
        <View style={styles.centered}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      );
    } else if (gameState === 'playing') {
      return renderGameView();
    } else if (gameState === 'finished') {
      return (
        <ScrollView contentContainerStyle={styles.centered}>
          <Text style={styles.finalText}>Time's Up!</Text>
          <Text style={styles.finalText}>Your Score: {finalScore} pts</Text>
          <Text style={styles.finalSubText}>
            (Words that also appeared for the computer are struck through.)
          </Text>
          <Text style={styles.wordsTitle}>Your Final Words:</Text>
          <View style={styles.wordsList}>
            {userWords.map((word, index) => {
              const conflict = computerWords.includes(word.toUpperCase());
              return (
                <Text
                  key={index}
                  style={[styles.wordItem, conflict && styles.strikethrough]}
                >
                  {word} ({word.length})
                </Text>
              );
            })}
          </View>
          {renderLeaderboard()}
        </ScrollView>
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
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  timerText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  letterText: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 5,
  },
  instructions: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    width: 150,
    height: 40,
    marginRight: 10,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  submittedTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  wordsList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
    width: '100%',
  },
  wordItem: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  finalText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  finalSubText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  wordsTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },
  leaderboardContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  leaderboardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  leaderboardEntryContainer: {
    marginVertical: 5,
    alignItems: 'center',
  },
  leaderboardEntryText: {
    fontSize: 20,
  },
  leaderboardWords: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 3,
  },
});

