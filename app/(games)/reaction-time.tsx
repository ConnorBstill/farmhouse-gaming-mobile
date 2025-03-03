import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";

type LeaderboardEntry = {
  id: number;
  averageReaction: number; // lower is better
};

type GameState = "countdown" | "waiting" | "active" | "finished";

export default function App() {
  // Game state variables.
  const [gameState, setGameState] = useState<GameState>("countdown");
  const [countdown, setCountdown] = useState<number>(3);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isGreen, setIsGreen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Countdown effect: 3 seconds before game starts.
  useEffect(() => {
    if (gameState === "countdown") {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState("waiting");
            startRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  // Function to start a round.
  const startRound = () => {
    // Ensure button is not green.
    setIsGreen(false);
    // Wait a random delay between 2000ms and 5000ms.
    const delay = Math.floor(Math.random() * 3000) + 2000;
    setTimeout(() => {
      // Turn the button green and record the start time.
      setIsGreen(true);
      setStartTime(Date.now());
      setGameState("active");
    }, delay);
  };

  // When the button is pressed.
  const handlePress = () => {
    if (gameState !== "active") return; // Only count press when active.
    const reactionTime = Date.now() - startTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    if (currentRound < 5) {
      setCurrentRound(currentRound + 1);
      setGameState("waiting");
      startRound();
    } else {
      setGameState("finished");
    }
  };

  // When game finishes, calculate average reaction time and update leaderboard.
  useEffect(() => {
    if (gameState === "finished") {
      const total = reactionTimes.reduce((sum, t) => sum + t, 0);
      const avg = total / reactionTimes.length;
      const newEntry: LeaderboardEntry = { id: Date.now(), averageReaction: avg };
      setLeaderboard(prev => [...prev, newEntry]);
    }
  }, [gameState]);

  // Restart the game.
  const handleRestart = () => {
    setGameState("countdown");
    setCountdown(3);
    setCurrentRound(1);
    setReactionTimes([]);
    setIsGreen(false);
  };

  // Render based on game state.
  if (gameState === "countdown") {
    return (
      <View style={styles.container}>
        <Text style={styles.countdownText}>{countdown}</Text>
      </View>
    );
  }

  if (gameState === "waiting" || gameState === "active") {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Round: {currentRound} / 5</Text>
        <Text style={styles.infoText}>
          {gameState === "waiting" ? "Wait for green..." : "Press NOW!"}
        </Text>
        <TouchableOpacity
          style={[styles.button, isGreen ? styles.greenButton : styles.redButton]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Tap!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameState === "finished") {
    const total = reactionTimes.reduce((sum, t) => sum + t, 0);
    const avg = Math.floor(total / reactionTimes.length);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Finished!</Text>
        <Text style={styles.infoText}>Average Reaction Time: {avg} ms</Text>
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        {leaderboard
          .sort((a, b) => a.averageReaction - b.averageReaction)
          .map((entry, index) => (
            <Text key={entry.id} style={styles.leaderboardEntry}>
              {index + 1}. {entry.averageReaction} ms
            </Text>
          ))}
        <Button title="Play Again" onPress={handleRestart} color="#4a90e2" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  countdownText: {
    fontSize: 80,
    color: "#fff",
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 24,
    color: "#fff",
    marginVertical: 10,
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  greenButton: {
    backgroundColor: "green",
  },
  redButton: {
    backgroundColor: "red",
  },
  buttonText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  leaderboardTitle: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 20,
  },
  leaderboardEntry: {
    fontSize: 20,
    color: "#fff",
    marginVertical: 4,
  },
});
