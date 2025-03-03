import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from 'react-native';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const WORDS = ['REACT', 'APPLE', 'WORLD', 'TRAIN', 'HOUSE'];

// QWERTY layout rows.
const QWERTY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

// Given a guess and the solution, return feedback for each letter.
// 'green' => correct letter and position,
// 'yellow' => letter exists in the word but in a different position,
// 'grey' => letter does not exist in the word.
function evaluateGuess(guess: string, solution: string): string[] {
  const feedback = new Array(guess.length).fill('grey');
  const solutionLetters = solution.split('');
  
  // First pass: mark greens.
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === solution[i]) {
      feedback[i] = 'green';
      solutionLetters[i] = null;
    }
  }
  
  // Second pass: mark yellows.
  for (let i = 0; i < guess.length; i++) {
    if (feedback[i] !== 'green') {
      const index = solutionLetters.indexOf(guess[i]);
      if (index !== -1) {
        feedback[i] = 'yellow';
        solutionLetters[index] = null;
      }
    }
  }
  return feedback;
}

export default function App() {
  // Game state and secret word.
  const [solutionWord, setSolutionWord] = useState<string>(
    () => WORDS[Math.floor(Math.random() * WORDS.length)]
  );
  const [guesses, setGuesses] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  // For tracking letters that have been used (always stored as uppercase)
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  // For countdown before game starts.
  const [countdown, setCountdown] = useState<number>(3);

  // Timer effect for countdown.
  React.useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  // Start the game once countdown finishes.
  React.useEffect(() => {
    if (countdown === 0 && gameStatus === 'playing' && guesses.length === 0) {
      // Reset timer.
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, gameStatus, guesses.length]);

  // Called when the player submits a guess.
  const handleSubmitGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      Alert.alert(`Please enter a ${WORD_LENGTH}-letter word.`);
      return;
    }
    const guess = currentGuess.toUpperCase();
    const feedback = evaluateGuess(guess, solutionWord);
    
    const newGuesses = [...guesses, guess];
    const newFeedbacks = [...feedbacks, feedback];
    setGuesses(newGuesses);
    setFeedbacks(newFeedbacks);
    setCurrentGuess('');

    // Update the used letters set.
    setUsedLetters(prev => {
      const newSet = new Set(prev);
      guess.split('').forEach(letter => newSet.add(letter));
      return Array.from(newSet);
    });
    
    if (guess === solutionWord) {
      setGameStatus('won');
      Alert.alert('Congratulations!', 'You guessed the word!');
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameStatus('lost');
      Alert.alert('Game Over', `The correct word was ${solutionWord}`);
    }
  };

  // Restart the game.
  const handleRestart = () => {
    setGuesses([]);
    setFeedbacks([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setSolutionWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setTimeElapsed(0);
    setUsedLetters([]);
    setCountdown(3);
  };

  // Render the Wordle board: 6 rows × 5 cells.
  const renderBoard = () => {
    const rows = [];
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const guess = guesses[i] || '';
      const feedback = feedbacks[i] || [];
      const cells = [];
      for (let j = 0; j < WORD_LENGTH; j++) {
        const letter = guess[j] || '';
        let backgroundColor = '#fff';
        if (feedback[j] === 'green') {
          backgroundColor = '#6aaa64';
        } else if (feedback[j] === 'yellow') {
          backgroundColor = '#c9b458';
        } else if (feedback[j] === 'grey') {
          backgroundColor = '#787c7e';
        } else if (guess) {
          // If the row has been submitted but not all letters got a feedback yet.
          backgroundColor = '#ddd';
        }
        cells.push(
          <View key={j} style={[styles.cell, { backgroundColor }]}>
            <Text style={styles.cellText}>{letter}</Text>
          </View>
        );
      }
      rows.push(
        <View key={i} style={styles.row}>
          {cells}
        </View>
      );
    }
    return <View style={styles.board}>{rows}</View>;
  };

  // Render a QWERTY keyboard indicator.
  const renderKeyboard = () => {
    return (
      <View style={styles.keyboardContainer}>
        {QWERTY_ROWS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map(letter => {
              const isUsed = usedLetters.includes(letter);
              return (
                <View
                  key={letter}
                  style={[
                    styles.key,
                    isUsed ? styles.keyUsed : styles.keyNotUsed,
                  ]}
                >
                  <Text style={styles.keyText}>{letter}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // Render the entire content.
  const renderContent = () => {
    if (countdown > 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      );
    } else if (gameStatus === 'playing') {
      return (
        <View style={styles.container}>
          <Text style={styles.timerText}>Time: {timeElapsed}s</Text>
          {renderBoard()}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={currentGuess}
              onChangeText={setCurrentGuess}
              autoCapitalize="characters"
              maxLength={WORD_LENGTH}
              placeholder="Enter guess"
            />
            <Button title="Submit" onPress={handleSubmitGuess} />
          </View>
          {renderKeyboard()}
        </View>
      );
    } else if (gameStatus === 'won' || gameStatus === 'lost') {
      return (
        <View style={styles.centered}>
          <Text style={styles.finalText}>
            {gameStatus === 'won' ? 'Congratulations! ' : 'Game Over! '}
            The word was: {solutionWord}
          </Text>
          <Text style={styles.timerText}>Time: {timeElapsed}s</Text>
          <Button title="Restart" onPress={handleRestart} />
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
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 24,
    marginVertical: 10,
  },
  board: {
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 50,
    height: 50,
    margin: 5,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
  finalText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Keyboard styles.
  keyboardContainer: {
    marginTop: 20,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  key: {
    width: 30,
    height: 40,
    marginHorizontal: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  keyUsed: {
    backgroundColor: '#787c7e',
  },
  keyNotUsed: {
    backgroundColor: '#ddd',
  },
});

