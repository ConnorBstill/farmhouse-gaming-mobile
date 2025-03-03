import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const DEVICE_WIDTH = Dimensions.get('window').width;

type LeaderboardEntry = {
  rounds: number;
  date: string;
};

type GamePhase = 'countdown' | 'showPattern' | 'userInput' | 'gameOver';

const PatternMemorizationGame: React.FC = () => {
  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [gridSize, setGridSize] = useState<number>(3);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Countdown effect before the game starts.
  useEffect(() => {
    if (gamePhase === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        startRound();
      }
    }
  }, [countdown, gamePhase]);

  // Start a new round by generating a random pattern.
  const startRound = () => {
    // Determine pattern length; here we use round + 2, capped by total squares.
    const totalSquares = gridSize * gridSize;
    const patternLength = Math.min(currentRound + 2, totalSquares);
    const newPattern: number[] = [];
    // Ensure unique squares in the pattern.
    while (newPattern.length < patternLength) {
      const rand = Math.floor(Math.random() * totalSquares);
      if (!newPattern.includes(rand)) {
        newPattern.push(rand);
      }
    }
    setPattern(newPattern);
    setUserInput([]);
    setGamePhase('showPattern');

    // Show the pattern for 1 second then let the user input.
    setTimeout(() => {
      setGamePhase('userInput');
    }, 1000);
  };

  // Utility: compare two arrays (order-insensitive)
  const arraysEqual = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  // Handle user tapping a square.
  const handleSquarePress = (index: number) => {
    if (gamePhase !== 'userInput') return;
    // Prevent duplicate selection.
    if (userInput.includes(index)) return;
    const newUserInput = [...userInput, index];
    setUserInput(newUserInput);

    // Once the user has selected as many squares as in the pattern, validate.
    if (newUserInput.length === pattern.length) {
      if (arraysEqual(newUserInput, pattern)) {
        // Correct – advance to the next round.
        setTimeout(() => {
          // Every 3 rounds, increase grid size.
          if (currentRound % 3 === 0) {
            setGridSize(prev => prev + 1);
          }
          setCurrentRound(prev => prev + 1);
          startRound();
        }, 500);
      } else {
        // Incorrect input; game over.
        setGamePhase('gameOver');
        const newEntry: LeaderboardEntry = {
          rounds: currentRound,
          date: new Date().toLocaleString(),
        };
        setLeaderboard(prev => [...prev, newEntry]);
      }
    }
  };

  // Render the grid of squares.
  const renderGrid = () => {
    const squares = [];
    const totalSquares = gridSize * gridSize;
    for (let i = 0; i < totalSquares; i++) {
      // During pattern display, light up squares that are part of the pattern.
      // During user input, highlight squares that the user has selected.
      const isPatternLit = gamePhase === 'showPattern' && pattern.includes(i);
      const isSelected = gamePhase === 'userInput' && userInput.includes(i);
      squares.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.square,
            { backgroundColor: isPatternLit ? '#1E88E5' : '#555' },
            isSelected && styles.selectedSquare,
          ]}
          onPress={() => handleSquarePress(i)}
          activeOpacity={gamePhase === 'userInput' ? 0.7 : 1}
          disabled={gamePhase !== 'userInput'}
        >
          {isSelected && <Text style={styles.squareText}>✓</Text>}
        </TouchableOpacity>
      );
    }
    return (
      <View
        style={[
          styles.grid,
          { width: gridSize * 80, height: gridSize * 80 },
        ]}
      >
        {squares}
      </View>
    );
  };

  // Reset the game to its initial state.
  const resetGame = () => {
    setGamePhase('countdown');
    setCountdown(3);
    setGridSize(3);
    setCurrentRound(1);
    setPattern([]);
    setUserInput([]);
  };

  // Render game-over and leaderboard screen.
  const renderGameOver = () => (
    <View style={styles.gameOverContainer}>
      <Text style={styles.gameOverText}>Game Over!</Text>
      <Text style={styles.gameOverText}>You reached round {currentRound}</Text>
      <TouchableOpacity onPress={resetGame} style={styles.button}>
        <Text style={styles.buttonText}>Restart Game</Text>
      </TouchableOpacity>
      <Text style={styles.leaderboardTitle}>Leaderboard</Text>
      {leaderboard.map((entry, index) => (
        <Text key={index} style={styles.leaderboardEntry}>
          {entry.date}: {entry.rounds} rounds
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {gamePhase === 'countdown' && (
        <Text style={styles.countdownText}>{countdown}</Text>
      )}
      {(gamePhase === 'showPattern' || gamePhase === 'userInput') && (
        <>
          <Text style={styles.infoText}>
            {gamePhase === 'showPattern'
              ? 'Memorize the pattern!'
              : 'Repeat the pattern!'}
          </Text>
          {renderGrid()}
        </>
      )}
      {gamePhase === 'gameOver' && renderGameOver()}
      {gamePhase !== 'gameOver' && (
        <Text style={styles.roundText}>Round: {currentRound}</Text>
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
  infoText: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  square: {
    width: 70,
    height: 70,
    margin: 5,
    backgroundColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSquare: {
    borderColor: '#1E88E5',
    borderWidth: 2,
  },
  squareText: {
    color: '#FFF',
    fontSize: 32,
  },
  roundText: {
    fontSize: 20,
    color: '#FFF',
    marginTop: 20,
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
