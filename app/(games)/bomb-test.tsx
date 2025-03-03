import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";

const GRID_SIZE = 4;
const TOTAL_CELLS = 24;

const generateBombPosition = () => {
  return Math.floor(Math.random() * TOTAL_CELLS);
};

const Minesweeper = () => {
  const [bombPosition, setBombPosition] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>(Array(TOTAL_CELLS).fill(false));
  const [gameOver, setGameOver] = useState(false);
  const [safeCount, setSafeCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);
  
  useEffect(() => {
    setBombPosition(generateBombPosition());
    setTimeout(() => {
      setGameStarted(true);
    }, 3000);
  }, []);
  
  const handlePress = (index: number) => {
    if (!gameStarted || gameOver) return;
    if (revealed[index]) return;
    
    if (index === bombPosition) {
      setGameOver(true);
      Alert.alert("Game Over", "💥 You hit the bomb!", [{ text: "OK", onPress: resetGame }]);
    } else {
      const newRevealed = [...revealed];
      newRevealed[index] = true;
      setRevealed(newRevealed);
      setSafeCount(safeCount + 1);
    }
  };
  
  const cashOut = () => {
    if (gameOver || !gameStarted) return;
    setLeaderboard([...leaderboard, safeCount].sort((a, b) => b - a));
    Alert.alert("You Win!", `You cashed out with ${safeCount} safe squares!`, [{ text: "OK", onPress: resetGame }]);
  };
  
  const resetGame = () => {
    setBombPosition(generateBombPosition());
    setRevealed(Array(TOTAL_CELLS).fill(false));
    setGameOver(false);
    setSafeCount(0);
    setGameStarted(false);
    setTimeout(() => setGameStarted(true), 3000);
  };

  return (
    <View style={styles.container}>
      {!gameStarted ? (
        <>
          <Text style={styles.message}>Find as many safe squares as you can, don't find the bomb or YOU LOSE!</Text>
          <Text style={styles.message}>Game starts in 3 seconds...</Text>
        </>
      ) : (
        <>
          <View style={styles.grid}>
            {Array.from({ length: TOTAL_CELLS }).map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.cell, revealed[index] && styles.safeCell]}
                onPress={() => handlePress(index)}
              >
                {gameOver && index === bombPosition ? <Text style={styles.bombEmoji}>💣</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.cashOutButton} onPress={cashOut}>
            <Text style={styles.buttonText}>Cash Out</Text>
          </TouchableOpacity>
          <View style={styles.leaderboard}>
            <Text style={styles.leaderboardTitle}>Leaderboard</Text>
            {leaderboard.map((score, index) => (
              <Text key={index} style={styles.leaderboardText}>{index + 1}. {score} safe squares</Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
    paddingBottom: 50,
  },
  message: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  grid: {
    width: 250,
    height: 250,
    flexWrap: "wrap",
    flexDirection: "row",
    marginTop: 20,
  },
  cell: {
    width: 50,
    height: 50,
    backgroundColor: "#444",
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  safeCell: {
    backgroundColor: "green",
  },
  bombEmoji: {
    fontSize: 24,
  },
  cashOutButton: {
    marginTop: 0,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  leaderboard: {
    marginTop: 20,
    alignItems: "center",
  },
  leaderboardTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  leaderboardText: {
    fontSize: 16,
    color: "white",
  },
});

export default Minesweeper;