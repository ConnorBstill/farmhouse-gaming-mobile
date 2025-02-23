import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const targetTimes = [3000, 5000, 7000, 10000];

const TimeEstimationGame = () => {
  const [targetTime, setTargetTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const startGame = () => {
    const randomTime =
      targetTimes[Math.floor(Math.random() * targetTimes.length)];
    setTargetTime(randomTime);
    setStartTime(Date.now());
    setGameRunning(true);
  };

  const stopGame = () => {
    if (!startTime) return;
    const elapsedTime = Date.now() - startTime;
    const difference = Math.abs(elapsedTime - targetTime);
    const calculatedScore = Math.max(10000 - difference, 0);
    setScore(calculatedScore);
    setGameRunning(false);
    saveScore(calculatedScore);
  };

  const saveScore = async (finalScore: number) => {
    try {
      const storedScores = await AsyncStorage.getItem("leaderboard");
      const scores = storedScores ? JSON.parse(storedScores) : [];
      const updatedScores = [...scores, finalScore]
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
        <TouchableOpacity style={styles.tapArea} onPress={stopGame}>
          <Text style={styles.tapText}>
            Tap when you think {targetTime / 1000} seconds have passed!
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.leaderboardContainer}>
          <Text
          // style={styles.title}
          >
            Leaderboard
          </Text>
          {leaderboard.map((item, index) => (
            <Text key={index} style={styles.leaderboardItem}>
              {index + 1}. {item} points
            </Text>
          ))}
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  tapArea: {
    width: "80%",
    height: 200,
    backgroundColor: "lightgray",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  tapText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center" 
  },
  leaderboardContainer: { 
    alignItems: "center" 
  },
  leaderboardItem: { 
    fontSize: 18, 
    marginBottom: 5 
  },
  startButton: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
});

export default TimeEstimationGame;
