import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const SEQUENCE_LENGTH = 5;

const SimonGame = () => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [gameRunning, setGameRunning] = useState(false);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const startGame = () => {
    const newSequence = Array.from({ length: SEQUENCE_LENGTH }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
    setSequence(newSequence);
    setUserInput([]);
    setScore(0);
    setGameRunning(true);
  };

  const handleUserInput = (color: string) => {
    if (!gameRunning) return;
    const newInput = [...userInput, color];
    setUserInput(newInput);
    
    if (newInput.join('') === sequence.slice(0, newInput.length).join('')) {
      if (newInput.length === sequence.length) {
        setScore(score + 1);
        startGame();
      }
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setGameRunning(false);
    saveScore(score);
  };

  const saveScore = async (score: number) => {
    try {
      const storedScores = await AsyncStorage.getItem('sequence-leaderboard');
      const scores = storedScores ? JSON.parse(storedScores) : [];
      const updatedScores = [...scores, score].sort((a, b) => b - a).slice(0, 5);
      await AsyncStorage.setItem('sequence-leaderboard', JSON.stringify(updatedScores));
      setLeaderboard(updatedScores);
    } catch (error) {
      console.error('Failed to save score', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const storedScores = await AsyncStorage.getItem('sequence-leaderboard');
      if (storedScores) {
        setLeaderboard(JSON.parse(storedScores));
      }
    } catch (error) {
      console.error('Failed to load leaderboard', error);
    }
  };

  return (
    <View style={styles.container}>
      {gameRunning ? (
        <View style={styles.gameArea}>
          <Text style={styles.title}>Remember the sequence!</Text>
          <View style={styles.buttonContainer}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorButton, { backgroundColor: color }]}
                onPress={() => handleUserInput(color)}
              />
            ))}
          </View>
          <Text style={styles.score}>Score: {score}</Text>
        </View>
      ) : (
        <View style={styles.leaderboardContainer}>
          <Text style={styles.title}>Leaderboard</Text>
          {leaderboard.map((item, index) => (
            <Text key={index} style={styles.leaderboardItem}>{index + 1}. {item} points</Text>
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gameArea: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', marginTop: 20 },
  colorButton: { width: 70, height: 70, margin: 10, borderRadius: 35 },
  score: { fontSize: 20, marginTop: 20 },
  leaderboardContainer: { alignItems: 'center' },
  leaderboardItem: { fontSize: 18, marginBottom: 5 },
  startButton: { backgroundColor: 'blue', padding: 15, borderRadius: 10, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default SimonGame;