import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

type LeaderboardEntry = {
  score: number;
  date: string;
};

type Phase = 'countdown' | 'playing' | 'gameOver';

const ColorGame: React.FC = () => {
  // Game state
  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [round, setRound] = useState<number>(1);
  const [baseColor, setBaseColor] = useState<string>('');
  const [oddColor, setOddColor] = useState<string>('');
  const [oddIndex, setOddIndex] = useState<number>(-1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Countdown effect before starting the game.
  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // When countdown finishes, initialize the first round.
        initializeRound();
        setPhase('playing');
      }
    }
  }, [countdown, phase]);

  // Generate a base colour and an odd one by applying a small difference.
  const generateColors = (currentRound: number) => {
    // The difference becomes smaller with each round, but never goes below 5.
    const diff = Math.max(50 - (currentRound - 1) * 3, 5);
    // Randomly choose whether to brighten or darken the odd square.
    const sign = Math.random() < 0.5 ? 1 : -1;
    // Ensure the base colour channels allow for a safe adjustment.
    const min = diff;
    const max = 255 - diff;
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    const g = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;
    const base = `rgb(${r}, ${g}, ${b})`;
    // Adjust each channel by the difference.
    const r2 = Math.min(Math.max(r + sign * diff, 0), 255);
    const g2 = Math.min(Math.max(g + sign * diff, 0), 255);
    const b2 = Math.min(Math.max(b + sign * diff, 0), 255);
    const odd = `rgb(${r2}, ${g2}, ${b2})`;
    return { baseColor: base, oddColor: odd };
  };

  // Initialize a round by generating new colours and selecting an odd square.
  const initializeRound = () => {
    const { baseColor, oddColor } = generateColors(round);
    setBaseColor(baseColor);
    setOddColor(oddColor);
    // The grid has 25 squares (indices 0–24)
    const randomIndex = Math.floor(Math.random() * 24);
    setOddIndex(randomIndex);
  };

  // Handle the user tapping a square.
  const handleSquarePress = (index: number) => {
    if (phase !== 'playing') return;
    if (index === oddIndex) {
      // Correct selection: increment round and reinitialize.
      setRound(prev => prev + 1);
      initializeRound();
    } else {
      // Incorrect selection: game over.
      setPhase('gameOver');
      const entry: LeaderboardEntry = {
        score: round,
        date: new Date().toLocaleString(),
      };
      setLeaderboard(prev => [...prev, entry]);
    }
  };

  // Render the 5x5 grid.
  const renderGrid = () => {
    const squares = [];
    for (let i = 0; i < 24; i++) {
      const bgColor = i === oddIndex ? oddColor : baseColor;
      squares.push(
        <TouchableOpacity
          key={i}
          style={[styles.square, { backgroundColor: bgColor }]}
          onPress={() => handleSquarePress(i)}
          activeOpacity={phase === 'playing' ? 0.7 : 1}
          disabled={phase !== 'playing'}
        />
      );
    }
    return <View style={styles.grid}>{squares}</View>;
  };

  // Restart the game.
  const resetGame = () => {
    setCountdown(3);
    setRound(1);
    setBaseColor('');
    setOddColor('');
    setOddIndex(-1);
    setPhase('countdown');
  };

  // Render a visual stack of cubes to represent the score.
  const renderScoreCubes = (score: number) => {
    const cubes = [];
    for (let i = 0; i < score; i++) {
      cubes.push(<View key={i} style={styles.cube} />);
    }
    return <View style={styles.cubeContainer}>{cubes}</View>;
  };

  // Render the leaderboard screen.
  const renderLeaderboard = () => (
    <View style={styles.gameOverContainer}>
      <Text style={styles.gameOverText}>Game Over!</Text>
      <Text style={styles.gameOverText}>You reached round {round}</Text>
      <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
        <Text style={styles.buttonText}>Restart Game</Text>
      </TouchableOpacity>
      <Text style={styles.leaderboardTitle}>Leaderboard</Text>
      <ScrollView style={styles.leaderboardContainer}>
        {leaderboard.map((entry, index) => (
          <View key={index} style={styles.leaderboardEntry}>
            <Text style={styles.leaderboardText}>
              {entry.date}: {entry.score} rounds
            </Text>
            {renderScoreCubes(entry.score)}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {phase === 'countdown' && (
        <Text style={styles.countdownText}>{countdown}</Text>
      )}
      {phase === 'playing' && (
        <>
          <Text style={styles.roundText}>Round: {round}</Text>
          {renderGrid()}
        </>
      )}
      {phase === 'gameOver' && renderLeaderboard()}
    </View>
  );
};

export default ColorGame;

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
  roundText: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
  },
  grid: {
    width: 250, // 5 squares * 50 width (plus margins)
    height: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  square: {
    width: 45,
    height: 45,
    margin: 5,
    borderRadius: 5,
  },
  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverText: {
    fontSize: 32,
    color: '#FFF',
    marginVertical: 10,
  },
  resetButton: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 5,
    marginVertical: 20,
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
  leaderboardContainer: {
    width: '100%',
    maxHeight: '40%',
    marginTop: 10,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  leaderboardText: {
    color: '#FFF',
    fontSize: 18,
    flex: 1,
  },
  cubeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cube: {
    width: 10,
    height: 10,
    backgroundColor: '#FFF',
    margin: 1,
  },
});
