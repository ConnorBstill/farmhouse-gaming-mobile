import React, { useState, useRef } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";

const ReactionTimeTester: React.FC = () => {
  const [backgroundColor, setBackgroundColor] = useState<string>("white");
  const [message, setMessage] = useState<string>(
    "Wait for the screen to change color...",
  );
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startGame = (): void => {
    // Reset state
    setBackgroundColor("white");
    setMessage("Wait for the screen to change color...");
    setReactionTime(null);

    // Random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000;

    timerRef.current = setTimeout(() => {
      setBackgroundColor("green");
      setMessage("Tap now!");
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handlePress = (): void => {
    if (backgroundColor === "green") {
      const endTime = Date.now();
      const reaction = endTime - (startTimeRef.current || 0);
      setReactionTime(reaction);
      setMessage(`Your reaction time: ${reaction} ms`);
      setBackgroundColor("white");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      setMessage("Too soon! Wait for the color to change.");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      activeOpacity={1}
      onPress={handlePress}
    >
      <Text style={styles.message}>{message}</Text>
      {reactionTime !== null && (
        <Text style={styles.reactionTime}>
          Reaction Time: {reactionTime} ms
        </Text>
      )}
      <Button title="Start" onPress={startGame} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  reactionTime: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default ReactionTimeTester;
