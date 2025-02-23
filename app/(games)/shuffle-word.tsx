import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const words = [
  "apple",
  "banana",
  "cherry",
  "developer",
  "elephant",
  "framework",
  "javascript",
  "reactnative",
];

const shuffleWord = (word: string) => {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

const WordUnscrambleGame = () => {
  const [originalWord, setOriginalWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const startGame = () => {
    setScore(0);
    nextWord();
    setGameRunning(true);
  };

  const nextWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setOriginalWord(word);
    setScrambledWord(shuffleWord(word));
    setUserInput("");
    setStartTime(Date.now());
  };

  const checkAnswer = () => {
    if (userInput.toLowerCase() === originalWord.toLowerCase()) {
      const timeTaken = Date.now() - (startTime || 0);
      const calculatedScore = Math.max(10000 - timeTaken, 0);
      setScore(score + calculatedScore);
      nextWord();
    }
  };

  const endGame = async () => {
    setGameRunning(false);
    saveScore(score);
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
        <View>
          <Text style={styles.scrambledWord}>{scrambledWord}</Text>
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            onSubmitEditing={checkAnswer}
            autoFocus
          />
          <Text style={styles.score}>Score: {score}</Text>
          <TouchableOpacity style={styles.endButton} onPress={endGame}>
            <Text style={styles.buttonText}>End Game</Text>
          </TouchableOpacity>
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
  scrambledWord: {
    fontSize: 24,
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
  endButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default WordUnscrambleGame;
