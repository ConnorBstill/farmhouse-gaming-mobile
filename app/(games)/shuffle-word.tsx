import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Keyboard,
} from 'react-native';

type LeaderboardEntry = {
  id: number;
  score: number;
};

// A small dictionary of words grouped by letter count.
// You can expand these lists with additional words.
const WORDS: { [key: number]: string[] } = {
  4: ['game', 'word', 'code', 'play', 'test'],
  5: ['apple', 'react', 'train', 'crazy', 'input'],
  6: ['planet', 'stream', 'forest', 'bounce', 'rabbit'],
  7: ['example', 'picture', 'network', 'fantasy', 'passion'],
};

const scrambleWord = (word: string): string => {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // If the scrambled word is identical to the original, scramble again (if word is long enough).
  if (arr.join('') === word && word.length > 3) {
    return scrambleWord(word);
  }
  return arr.join('');
};

const App = () => {
  // Game states: "countdown" -> "playing" -> "finished"
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [gameTime, setGameTime] = useState(20);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [round, setRound] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Generate a new word based on the current round.
  // We start with 4-letter words and add one letter after every 2 correct guesses.
  const generateNewWord = () => {
    const letterCount = 4 + Math.floor(round / 2);
    const possibleWords = WORDS[letterCount];
    if (!possibleWords || possibleWords.length === 0) {
      // If there is no list for the current length, fall back to the highest available.
      const maxAvailable = Math.max(...Object.keys(WORDS).map(Number));
      const fallbackWords = WORDS[maxAvailable];
      const word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
      setCurrentWord(word);
      setScrambledWord(scrambleWord(word));
      return;
    }
    const word = possibleWords[Math.floor(Math.random() * possibleWords.length)];
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
  };

  // Countdown before starting the game.
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(countdownInterval);
      } else {
        setGameState('playing');
        generateNewWord();
      }
    }
  }, [gameState, countdown]);

  // Game timer for the 20‑second gameplay.
  useEffect(() => {
    let gameInterval: NodeJS.Timeout;
    if (gameState === 'playing') {
      if (gameTime > 0) {
        gameInterval = setInterval(() => {
          setGameTime((prev) => prev - 1);
        }, 1000);
      } else {
        setGameState('finished');
        // Add final score to the leaderboard.
        const newEntry: LeaderboardEntry = { id: Date.now(), score };
        setLeaderboard((prev) => [...prev, newEntry]);
        Keyboard.dismiss();
      }
    }
    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [gameState, gameTime, score]);

  // Handle when the user submits their answer.
  const handleSubmit = () => {
    if (userAnswer.trim().toLowerCase() === currentWord.toLowerCase()) {
      setScore((prev) => prev + 1);
      setRound((prev) => prev + 1);
      generateNewWord();
    }
    // Clear input regardless of correctness.
    setUserAnswer('');
  };

  // Restart the game.
  const handleRestart = () => {
    setCountdown(3);
    setGameTime(20);
    setScore(0);
    setRound(0);
    setUserAnswer('');
    setCurrentWord('');
    setScrambledWord('');
    setGameState('countdown');
  };

  // Render different UI based on the current game state.
  const renderGame = () => {
    if (gameState === 'countdown') {
      return (
        <View style={styles.centered}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      );
    } else if (gameState === 'playing') {
      return (
        <View style={styles.gameContainer}>
          <Text style={styles.timerText}>Time: {gameTime}</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.scrambledText}>{scrambledWord}</Text>
          <TextInput
            style={styles.input}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Type your answer"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSubmit}
          />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      );
    } else if (gameState === 'finished') {
      // Sort the leaderboard in descending order.
      const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);
      return (
        <View style={styles.centered}>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          {sortedLeaderboard.map((entry, index) => (
            <Text key={entry.id} style={styles.leaderboardEntry}>
              {index + 1}. {entry.score}
            </Text>
          ))}
          <Button title="Play Again" onPress={handleRestart} />
        </View>
      );
    }
  };

  return <View style={styles.container}>{renderGame()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 24,
    marginBottom: 10,
  },
  scrambledText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  finalScore: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginVertical: 10,
  },
  leaderboardEntry: {
    fontSize: 20,
  },
});

export default App;
