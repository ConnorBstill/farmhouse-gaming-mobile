import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GAME_DURATION = 10; // Game duration in seconds

const TapGame = () => {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameRunning, setGameRunning] = useState(false);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameRunning, timeLeft]);

  const startGame = () => {
    setCount(0);
    setTimeLeft(GAME_DURATION);
    setGameRunning(true);
  };

  const endGame = async () => {
    setGameRunning(false);
    saveScore(count);
  };

  const handlePress = () => {
    if (gameRunning) {
      setCount((prev) => prev + 1);
    }
  };

  const saveScore = async (score: number) => {
    try {
      const storedScores = await AsyncStorage.getItem("leaderboard");
      const scores = storedScores ? JSON.parse(storedScores) : [];
      const updatedScores = [...scores, score]
        .sort((a, b) => b - a)
        .slice(0, 5);
      await AsyncStorage.setItem("leaderboard", JSON.stringify(updatedScores));
      setLeaderboard(updatedScores);
    } catch (error) {
      console.error("Failed to save score", error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const storedScores = await AsyncStorage.getItem("leaderboard");
      if (storedScores) {
        setLeaderboard(JSON.parse(storedScores));
      }
    } catch (error) {
      console.error("Failed to load leaderboard", error);
    }
  };

  return (
    <View style={styles.container}>
      {gameRunning ? (
        <TouchableOpacity style={styles.gameArea} onPress={handlePress}>
          <Text style={styles.count}>Taps: {count}</Text>
          <Text style={styles.timer}>Time Left: {timeLeft}s</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.leaderboardContainer}>
          <Text style={styles.title}>Leaderboard</Text>
          <FlatList
            data={leaderboard}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Text style={styles.leaderboardItem}>
                {index + 1}. {item} taps
              </Text>
            )}
          />
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  gameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f0f0f0",
  },
  count: { fontSize: 30, fontWeight: "bold" },
  timer: { fontSize: 20, marginTop: 10, color: "red" },
  leaderboardContainer: { alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  leaderboardItem: { fontSize: 18, marginBottom: 5 },
  startButton: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default TapGame;
