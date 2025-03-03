import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const targetTimes = [3000, 5000, 7000, 10000];

const TimeEstimationGame = () => {
  const [targetTime, setTargetTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const startGame = () => {
    const randomTime =
      targetTimes[Math.floor(Math.random() * targetTimes.length)];
    setTargetTime(randomTime);
    setStartTime(Date.now());
    setGameRunning(true);
    setShowResult(false);
  };

  const stopGame = () => {
    if (!startTime) return;
    const elapsedTime = Date.now() - startTime;
    const difference = Math.abs(elapsedTime - targetTime);
    const calculatedScore = Math.max(10000 - difference, 0);
    setScore(calculatedScore);
    setGameRunning(false);
    setShowResult(true);
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

  const formatScore = (score: number) => {
    return score.toLocaleString();
  }

  const renderGameScreen = () => (
    <TouchableOpacity 
      style={styles.tapArea} 
      onPress={stopGame}
      activeOpacity={0.8}
    >
      <Text style={styles.targetTimeText}>
        Target: {targetTime / 1000} seconds
      </Text>
      <Text style={styles.tapText}>
        Tap when you think the time has passed!
      </Text>
    </TouchableOpacity>
  );

  const renderResultScreen = () => (
    <View style={styles.resultContainer}>
      <Text style={styles.resultTitle}>Your Result</Text>
      <Text style={styles.scoreText}>{formatScore(score)} points</Text>
      <Text style={styles.accuracy}>
        {Math.round((score / 10000) * 100)}% Accurate
      </Text>
      <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
        <Text style={styles.buttonText}>Play Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <Text style={styles.title}>Time Master</Text>
      
      <View style={styles.leaderboardCard}>
        <Text style={styles.leaderboardTitle}>Top Scores</Text>
        
        {leaderboard.length > 0 ? (
          leaderboard.map((item, index) => (
            <View key={index} style={styles.leaderboardRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.leaderboardItemScore}>
                {formatScore(item)}
              </Text>
              <Text style={styles.pointsText}>points</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noScoresText}>No scores yet. Play a game!</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {gameRunning ? (
        renderGameScreen()
      ) : showResult ? (
        renderResultScreen()
      ) : (
        renderLeaderboard()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20
  },
  tapArea: {
    width: "90%",
    height: 250,
    backgroundColor: "#272727",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: "#383838"
  },
  targetTimeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#bb86fc",
    marginBottom: 20
  },
  tapText: { 
    fontSize: 18, 
    fontWeight: "600", 
    textAlign: "center",
    color: "#e0e0e0"
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#bb86fc",
    marginBottom: 30,
    textAlign: "center"
  },
  leaderboardContainer: { 
    alignItems: "center",
    width: "100%"
  },
  leaderboardCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#303030"
  },
  leaderboardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e0e0e0",
    marginBottom: 15,
    textAlign: "center"
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#303030"
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#303030",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#bb86fc"
  },
  rankText: {
    color: "#bb86fc",
    fontWeight: "bold",
    fontSize: 16
  },
  leaderboardItemScore: { 
    fontSize: 20, 
    fontWeight: "bold",
    color: "#e0e0e0",
    flex: 1
  },
  pointsText: {
    fontSize: 16,
    color: "#9e9e9e"
  },
  noScoresText: {
    fontSize: 16,
    color: "#9e9e9e",
    textAlign: "center",
    paddingVertical: 20
  },
  startButton: {
    backgroundColor: "#bb86fc",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  buttonText: { 
    color: "#121212", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  resultContainer: {
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 30,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#303030"
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e0e0e0",
    marginBottom: 20
  },
  scoreText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#bb86fc",
    marginBottom: 10
  },
  accuracy: {
    fontSize: 18,
    color: "#9e9e9e",
    marginBottom: 30
  },
  playAgainButton: {
    backgroundColor: "#bb86fc",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  }
});

export default TimeEstimationGame;