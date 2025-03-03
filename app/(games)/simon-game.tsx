import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type GamePhase = 'countdown' | 'playSequence' | 'userInput' | 'gameOver';

type LeaderboardEntry = {
  score: number;
  date: string;
};

const PatternMemorizationGame: React.FC = () => {
  // Game phases and states.
  const [phase, setPhase] = useState<GamePhase>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Colours for our four squares.
  const colors = ['red', 'green', 'yellow', 'blue'];

  // --- Countdown effect ---
  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // When countdown finishes, start the first round.
        startNewRound();
      }
    }
  }, [countdown, phase]);

  // --- Start a new round ---
  const startNewRound = () => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    // Append a new random square (index 0-3) to the pattern.
    const nextSquare = Math.floor(Math.random() * 4);
    const newPattern = [...pattern, nextSquare];
    setPattern(newPattern);
    // Clear any previous user input.
    setUserInput([]);
    // Play back the sequence.
    playSequence(newPattern);
  };

  // --- Play the full sequence ---
  const playSequence = (seq: number[]) => {
    setPhase('playSequence');
    let i = 0;
    const playNext = () => {
      if (i < seq.length) {
        setHighlighted(seq[i]);
        // Highlight for 1000ms then clear.
        setTimeout(() => {
          setHighlighted(null);
          i++;
          // Wait 500ms between squares.
          setTimeout(playNext, 500);
        }, 1000);
      } else {
        // After playing the sequence, allow user input.
        setPhase('userInput');
      }
    };
    playNext();
  };

  // --- Handle user tapping a square ---
  const handlePress = (index: number) => {
    if (phase !== 'userInput') return;
    const nextIndex = userInput.length;
    // Check if the tapped square matches the pattern at this position.
    if (pattern[nextIndex] === index) {
      const newUserInput = [...userInput, index];
      setUserInput(newUserInput);
      // If the user completed the pattern correctly...
      if (newUserInput.length === pattern.length) {
        // Briefly highlight the last square as confirmation.
        setHighlighted(pattern[pattern.length - 1]);
        setTimeout(() => {
          setHighlighted(null);
          // Start the next round.
          startNewRound();
        }, 1000);
      }
    } else {
      // Wrong selection → game over.
      setPhase('gameOver');
      const entry: LeaderboardEntry = {
        score: currentRound,
        date: new Date().toLocaleString(),
      };
      setLeaderboard(prev => [...prev, entry]);
    }
  };

  // --- Reset the game ---
  const resetGame = () => {
    setPhase('countdown');
    setCountdown(3);
    setPattern([]);
    setUserInput([]);
    setCurrentRound(0);
  };

  return (
    <View style={styles.container}>
      {phase === 'countdown' && (
        <Text style={styles.countdownText}>{countdown}</Text>
      )}

      {phase !== 'gameOver' && (
        <View style={styles.gameContainer}>
          <Text style={styles.roundText}>Round: {currentRound}</Text>
          <View style={styles.gridContainer}>
            {colors.map((color, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.square,
                  { backgroundColor: color },
                  highlighted === idx && styles.highlightedSquare,
                ]}
                onPress={() => handlePress(idx)}
                activeOpacity={phase === 'userInput' ? 0.7 : 1}
                disabled={phase !== 'userInput'}
              />
            ))}
          </View>
          {phase === 'userInput' && (
            <Text style={styles.instructionText}>
              Repeat the sequence by tapping the squares
            </Text>
          )}
        </View>
      )}

      {phase === 'gameOver' && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.gameOverText}>You reached round {currentRound}</Text>
          <TouchableOpacity onPress={resetGame} style={styles.button}>
            <Text style={styles.buttonText}>Restart Game</Text>
          </TouchableOpacity>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          {leaderboard.map((entry, index) => (
            <Text key={index} style={styles.leaderboardEntry}>
              {entry.date}: {entry.score} rounds
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default PatternMemorizationGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  countdownText: {
    fontSize: 72,
    color: '#FFF',
  },
  gameContainer: {
    alignItems: 'center',
  },
  roundText: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 220,
    justifyContent: 'center',
  },
  square: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 8,
  },
  highlightedSquare: {
    borderWidth: 5,
    borderColor: '#FFF',
  },
  instructionText: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 10,
  },
  gameOverContainer: {
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 36,
    color: '#FFF',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#1E88E5',
    padding: 10,
    marginVertical: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
  },
  leaderboardTitle: {
    fontSize: 28,
    color: '#FFF',
    marginTop: 20,
  },
  leaderboardEntry: {
    fontSize: 18,
    color: '#FFF',
  },
});
