import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MathGame = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operation, setOperation] = useState('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const startGame = () => {
    setScore(0);
    setGameRunning(true);
    setStartTime(Date.now());
    generateQuestion();
  };

  const generateQuestion = () => {
    const newNum1 = Math.floor(Math.random() * 50);
    const newNum2 = Math.floor(Math.random() * 50);
    const newOperation = Math.random() > 0.5 ? '+' : '-';
    setNum1(newNum1);
    setNum2(newNum2);
    setOperation(newOperation);
    setUserAnswer('');
  };

  const checkAnswer = () => {
    const correctAnswer = operation === '+' ? num1 + num2 : num1 - num2;
    if (parseInt(userAnswer) === correctAnswer) {
      setScore(score + 1);
      generateQuestion();
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
      const storedScores = await AsyncStorage.getItem('leaderboard');
      const scores = storedScores ? JSON.parse(storedScores) : [];
      const updatedScores = [...scores, score].sort((a, b) => b - a).slice(0, 5);
      await AsyncStorage.setItem('leaderboard', JSON.stringify(updatedScores));
      setLeaderboard(updatedScores);
    } catch (error) {
      console.error('Failed to save score', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const storedScores = await AsyncStorage.getItem('leaderboard');
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
        <View>
          <Text style={styles.question}>{num1} {operation} {num2} = ?</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={userAnswer}
            onChangeText={setUserAnswer}
            onSubmitEditing={checkAnswer}
          />
          <Text style={styles.score}>Score: {score}</Text>
        </View>
      ) : (
        <View style={styles.leaderboardContainer}>
          <Text 
            // style={styles.title}
          >Leaderboard</Text>
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
  question: { fontSize: 30, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 2, fontSize: 24, width: 100, textAlign: 'center', marginBottom: 20 },
  score: { fontSize: 20, marginTop: 20 },
  leaderboardContainer: { alignItems: 'center' },
  leaderboardItem: { fontSize: 18, marginBottom: 5 },
  startButton: { backgroundColor: 'blue', padding: 15, borderRadius: 10, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default MathGame;
