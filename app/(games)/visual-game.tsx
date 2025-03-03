import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  Dimensions,
} from 'react-native';

// Types for a card and leaderboard entry.
type Card = {
  id: number;
  emoji: string;
  isRevealed: boolean;
  isMatched: boolean;
};

type LeaderboardEntry = {
  id: number;
  time: number; // time in seconds (lower is better)
};

const EMOJIS = ['🎉', '❤️', '🚀', '🍎', '🌟', '⚽️', '🎵', '🍔'];

// Utility to shuffle an array.
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export default function App() {
  type GameState = 'countdown' | 'playing' | 'finished';

  // Game state and timers.
  const [gameState, setGameState] = useState<GameState>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Board: an array of 20 cards.
  const [board, setBoard] = useState<Card[]>([]);
  // Store IDs of currently flipped (but not yet matched) cards.
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  // Leaderboard for final times.
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Generate a new board by duplicating and shuffling the emoji pairs.
  const generateBoard = () => {
    const duplicatedEmojis = [...EMOJIS, ...EMOJIS];
    const shuffledEmojis = shuffleArray(duplicatedEmojis);
    const newBoard = shuffledEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isRevealed: false,
      isMatched: false,
    }));
    setBoard(newBoard);
  };

  // Reset state and generate board when starting the game.
  const startGame = () => {
    setTimeElapsed(0);
    generateBoard();
    setSelectedCards([]);
    setGameState('playing');
  };

  // Restart the game (go back to countdown).
  const restartGame = () => {
    setCountdown(3);
    setTimeElapsed(0);
    setGameState('countdown');
  };

  // Countdown effect.
  useEffect(() => {
    if (gameState === 'countdown') {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Timer effect for gameplay.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // Check if all cards have been matched.
  useEffect(() => {
    if (gameState === 'playing' && board.length > 0) {
      const allMatched = board.every((card) => card.isMatched);
      if (allMatched) {
        setGameState('finished');
        // Add final time to leaderboard.
        const newEntry: LeaderboardEntry = { id: Date.now(), time: timeElapsed };
        setLeaderboard((prev) => [...prev, newEntry]);
      }
    }
  }, [board, gameState, timeElapsed]);

  // Handle card press.
  const handleCardPress = (cardId: number) => {
    if (gameState !== 'playing') return;
    // Ignore if the card is already revealed or matched or already selected.
    const card = board.find((c) => c.id === cardId);
    if (!card || card.isRevealed || card.isMatched || selectedCards.includes(cardId)) {
      return;
    }

    // Reveal the card.
    const newBoard = board.map((c) =>
      c.id === cardId ? { ...c, isRevealed: true } : c
    );
    setBoard(newBoard);

    const newSelection = [...selectedCards, cardId];
    setSelectedCards(newSelection);

    if (newSelection.length === 2) {
      // Check for match.
      const [firstId, secondId] = newSelection;
      const firstCard = newBoard.find((c) => c.id === firstId);
      const secondCard = newBoard.find((c) => c.id === secondId);
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // They match: mark as matched.
        const updatedBoard = newBoard.map((c) =>
          c.id === firstId || c.id === secondId
            ? { ...c, isMatched: true }
            : c
        );
        setBoard(updatedBoard);
        setSelectedCards([]);
      } else {
        // No match: hide them after a short delay.
        setTimeout(() => {
          const revertedBoard = newBoard.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isRevealed: false } : c
          );
          setBoard(revertedBoard);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // Render the board grid.
  const renderBoard = () => {
    return (
      <View style={styles.board}>
        {board.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.isMatched ? styles.cardMatched : styles.cardHidden,
            ]}
            onPress={() => handleCardPress(card.id)}
          >
            {card.isRevealed || card.isMatched ? (
              <Text style={styles.cardText}>{card.emoji}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render based on game state.
  const renderContent = () => {
    if (gameState === 'countdown') {
      return (
        <View style={styles.centered}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      );
    } else if (gameState === 'playing') {
      return (
        <View style={styles.container}>
          <Text style={styles.timerText}>Time: {timeElapsed}s</Text>
          {renderBoard()}
        </View>
      );
    } else if (gameState === 'finished') {
      // Sort leaderboard by fastest time.
      const sortedLeaderboard = leaderboard.sort((a, b) => a.time - b.time);
      return (
        <View style={styles.centered}>
          <Text style={styles.finalText}>
            Finished! Your time: {timeElapsed}s
          </Text>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          {sortedLeaderboard.map((entry, index) => (
            <Text key={entry.id} style={styles.leaderboardEntry}>
              {index + 1}. {entry.time}s
            </Text>
          ))}
          <Button title="Play Again" onPress={restartGame} />
        </View>
      );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 24,
    marginBottom: 10,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 320, // Adjust based on card size and spacing (e.g., 5 cards * 60 + margins)
    justifyContent: 'center',
  },
  card: {
    width: 60,
    height: 60,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHidden: {
    backgroundColor: '#ccc',
  },
  cardMatched: {
    backgroundColor: '#a0e',
  },
  cardText: {
    fontSize: 32,
  },
  finalText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 10,
  },
  leaderboardEntry: {
    fontSize: 20,
  },
});
