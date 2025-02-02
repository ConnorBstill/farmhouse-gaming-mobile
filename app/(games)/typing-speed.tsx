import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog.",
  "React Native enables you to build mobile apps with JavaScript.",
  "Practice makes perfect, so keep coding every day.",
];

const TypingGame = () => {
  const [textToType, setTextToType] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const startGame = () => {
    const randomText =
      sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setTextToType(randomText);
    setUserInput("");
    setGameRunning(true);
    setStartTime(Date.now());
  };

  const checkAnswer = () => {
    if (userInput === textToType) {
      const timeTaken = Date.now() - (startTime || 0);
      const calculatedScore = Math.max(10000 - timeTaken, 0);
      setScore(calculatedScore);
      endGame(calculatedScore);
    }
  };

  const endGame = async (finalScore: number) => {
    setGameRunning(false);
    saveScore(finalScore);
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
        <View>
          <Text style={styles.textToType}>{textToType}</Text>
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            onSubmitEditing={checkAnswer}
            autoFocus
          />
          <Text style={styles.score}>Score: {score}</Text>
        </View>
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
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  textToType: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 2,
    fontSize: 18,
    width: "80%",
    textAlign: "center",
    marginBottom: 20,
  },
  score: { fontSize: 20, marginTop: 20 },
  leaderboardContainer: { alignItems: "center" },
  leaderboardItem: { fontSize: 18, marginBottom: 5 },
  startButton: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default TypingGame;
