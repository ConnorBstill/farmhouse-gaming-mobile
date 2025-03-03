import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// ----- Types & Interfaces -----
type GamePhase = 'setup' | 'countdown' | 'selection' | 'result' | 'finished';

type Player = {
  id: string;
  name: string;
  eggplants: number; // current eggplant count
  toss?: number;     // number of eggplants tossed this round
  guess?: number;    // guess for total toss count
};

type LeaderboardEntry = {
  id: number;
  name: string;
  remainingEggplants: number;
};

// ----- Helper Functions -----
const getRandomLetter = (): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return alphabet[Math.floor(Math.random() * alphabet.length)];
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ----- Main App Component -----
export default function App() {
  // Game Phase: setup -> countdown -> selection -> result -> finished
  const [phase, setPhase] = useState<GamePhase>('setup');

  // Setup: choose number of players (including you)
  const [numPlayersInput, setNumPlayersInput] = useState<string>('2'); // default 2 players
  const [players, setPlayers] = useState<Player[]>([]);

  // Countdown timer (3 seconds)
  const [countdown, setCountdown] = useState<number>(3);

  // Round selection state:
  const [currentLetter, setCurrentLetter] = useState<string>('');
  // For human input in the selection phase:
  const [humanToss, setHumanToss] = useState<string>(''); // string to allow TextInput
  const [humanGuess, setHumanGuess] = useState<string>('');

  // In result phase, we compute:
  const [totalToss, setTotalToss] = useState<number | null>(null);

  // For showing the result screen for 3 seconds:
  const [resultTimer, setResultTimer] = useState<number>(3);

  // Leaderboard (accumulated from finished games)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // ----- Setup Phase -----
  // When user enters number of players and presses "Start Game", create players.
  const startSetup = () => {
    const num = parseInt(numPlayersInput, 10);
    if (isNaN(num) || num < 1 || num > 10) {
      Alert.alert('Invalid Input', 'Please enter a number between 1 and 10.');
      return;
    }
    // Create players: first is human ("You"), others are "CPU 1", "CPU 2", ...
    const newPlayers: Player[] = [];
    newPlayers.push({ id: 'human', name: 'You', eggplants: 2 });
    for (let i = 1; i < num; i++) {
      newPlayers.push({ id: `cpu${i}`, name: `CPU ${i}`, eggplants: 2 });
    }
    setPlayers(newPlayers);
    setPhase('countdown');
    setCountdown(3);
  };

  // ----- Countdown Phase -----
  useEffect(() => {
    if (phase === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Start the round: choose a random letter and transition to selection.
            setCurrentLetter(getRandomLetter());
            // Reset human inputs.
            setHumanToss('');
            setHumanGuess('');
            setPhase('selection');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // ----- Selection Phase -----
  // In this phase, each player chooses how many eggplants to toss.
  // For the human player, we collect input via UI.
  // For computer players, we simulate toss and guess immediately.
  const submitSelection = () => {
    // Validate human toss: must be 0 up to available eggplants.
    const humanPlayer = players.find(p => p.id === 'human');
    if (!humanPlayer) return;
    const available = humanPlayer.eggplants;
    const tossVal = parseInt(humanToss, 10);
    if (isNaN(tossVal) || tossVal < 0 || tossVal > available) {
      Alert.alert('Invalid Toss', `You can toss between 0 and ${available} eggplants.`);
      return;
    }
    // Validate human guess (should be a number; we allow any number from 0 to maxPossible).
    const guessVal = parseInt(humanGuess, 10);
    if (isNaN(guessVal) || guessVal < 0) {
      Alert.alert('Invalid Guess', 'Please enter a valid number for your guess.');
      return;
    }
    // Update human player in players array.
    const updatedPlayers = players.map(p =>
      p.id === 'human' ? { ...p, toss: tossVal, guess: guessVal } : p
    );

    // For each CPU player, simulate toss and guess.
    // CPU toss: random between 0 and their available eggplants.
    // CPU guess: random between 0 and (sum of available eggplants for all players).
    const totalAvailable = updatedPlayers.reduce((sum, p) => sum + p.eggplants, 0);
    const finalPlayers = updatedPlayers.map(p => {
      if (p.id !== 'human') {
        const cpuToss = randomInt(0, p.eggplants);
        const cpuGuess = randomInt(0, totalAvailable);
        return { ...p, toss: cpuToss, guess: cpuGuess };
      }
      return p;
    });

    setPlayers(finalPlayers);
    // Compute total toss.
    const tossSum = finalPlayers.reduce((sum, p) => sum + (p.toss || 0), 0);
    setTotalToss(tossSum);
    // Transition to result phase.
    setResultTimer(3);
    setPhase('result');
  };

  // ----- Result Phase -----
  // Show the total toss result (both as a number and that many eggplant emojis) for 3 seconds.
  useEffect(() => {
    if (phase === 'result') {
      const timer = setInterval(() => {
        setResultTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Update players: for each player whose guess equals total toss, reduce eggplants by 1.
            const updated = players.map(p => {
              if (p.guess === totalToss) {
                // Correct guess: reduce eggplants by 1.
                return { ...p, eggplants: Math.max(p.eggplants - 1, 0) };
              }
              return p;
            });
            setPlayers(updated);
            // Check win condition: if any player now has 0 eggplants, game finishes.
            const winner = updated.find(p => p.eggplants === 0);
            if (winner) {
              setPhase('finished');
            } else {
              // Otherwise, start the next round.
              setPhase('countdown');
              setCountdown(3);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, players, totalToss]);

  // ----- Finished Phase -----
  // When the game finishes, show a podium-style leaderboard.
  const renderLeaderboard = () => {
    // For podium ranking, sort players by eggplants ascending (0 is best).
    const sorted = [...players].sort((a, b) => a.eggplants - b.eggplants);
    return (
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Podium Leaderboard</Text>
        {sorted.map((p, index) => (
          <Text key={p.id} style={styles.leaderboardEntry}>
            {index + 1}. {p.name} — Eggplants left: {p.eggplants}
          </Text>
        ))}
        <Button title="Play Again" onPress={handleRestart} />
      </View>
    );
  };

  // ----- Restart Game -----
  const handleRestart = () => {
    setPhase('setup');
    setNumPlayersInput('2');
    setPlayers([]);
    setCountdown(3);
    setGameTime(30);
    setCurrentLetter('');
    setHumanToss('');
    setHumanGuess('');
    setTotalToss(null);
  };

  // ----- Rendering per Phase -----
  const renderSetup = () => (
    <View style={styles.centered}>
      <Text style={styles.title}>Eggplant Toss</Text>
      <Text style={styles.instructions}>
        Enter total number of players (1–10):
      </Text>
      <TextInput
        style={styles.input}
        value={numPlayersInput}
        onChangeText={setNumPlayersInput}
        keyboardType="number-pad"
        placeholder="e.g., 3"
      />
      <Button title="Start Game" onPress={startSetup} />
    </View>
  );

  const renderCountdown = () => (
    <View style={styles.centered}>
      <Text style={styles.countdownText}>{countdown}</Text>
    </View>
  );

  const renderSelection = () => {
    const humanPlayer = players.find(p => p.id === 'human');
    const available = humanPlayer ? humanPlayer.eggplants : 0;
    // Calculate total eggplants among all players.
    const totalEggplants = players.reduce((sum, p) => sum + p.eggplants, 0);
    return (
      <View style={styles.selectionContainer}>
        <Text style={styles.roundTitle}>
          Round – Your Letter: {currentLetter}
        </Text>
        <Text style={styles.instructions}>
          Total Eggplants Among All Players: {totalEggplants}
        </Text>
        <Text style={styles.instructions}>
          You have {available} eggplant{available !== 1 ? 's' : ''}. Choose how many to toss:
        </Text>
        <View style={styles.tossButtons}>
          {Array.from({ length: available + 1 }, (_, i) => i).map(num => (
            <TouchableOpacity
              key={num}
              style={[
                styles.tossButton,
                humanToss === num.toString() && styles.tossButtonSelected,
              ]}
              onPress={() => setHumanToss(num.toString())}
            >
              <Text style={styles.tossButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.instructions}>
          Now, guess the TOTAL number of eggplants tossed by all players:
        </Text>
        <TextInput
          style={styles.input}
          value={humanGuess}
          onChangeText={setHumanGuess}
          keyboardType="number-pad"
          placeholder="Your guess"
        />
        <Button title="Submit Selection" onPress={submitSelection} />
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            (Computer players will choose randomly based on their available eggplants.)
          </Text>
        </View>
      </View>
    );
  };

  const renderResult = () => (
    <View style={styles.centered}>
      <Text style={styles.resultTitle}>Result</Text>
      {totalToss !== null && (
        <>
          <Text style={styles.resultText}>
            Total Eggplants Tossed: {totalToss}
          </Text>
          <Text style={styles.emojiText}>
            {Array.from({ length: totalToss }, () => '🍆').join(' ')}
          </Text>
        </>
      )}
      <Text style={styles.resultTimer}>Next round in {resultTimer}s</Text>
    </View>
  );

  const renderFinished = () => (
    <ScrollView contentContainerStyle={styles.centered}>
      <Text style={styles.finalTitle}>Game Over!</Text>
      <Text style={styles.finalTitle}>
        Winner: {players.find(p => p.eggplants === 0)?.name || 'N/A'}
      </Text>
      {renderLeaderboard()}
    </ScrollView>
  );

  const renderContent = () => {
    switch (phase) {
      case 'setup':
        return renderSetup();
      case 'countdown':
        return renderCountdown();
      case 'selection':
        return renderSelection();
      case 'result':
        return renderResult();
      case 'finished':
        return renderFinished();
      default:
        return null;
    }
  };

  return <View style={styles.mainContainer}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#f0f0f0',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    width: 150,
    height: 40,
    marginVertical: 10,
    textAlign: 'center',
    backgroundColor: '#fff',
    fontSize: 18,
  },
  instructions: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  selectionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  roundTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  tossButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  tossButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 4,
  },
  tossButtonSelected: {
    backgroundColor: '#2a70c2',
  },
  tossButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 26,
    marginBottom: 10,
  },
  emojiText: {
    fontSize: 32,
    marginBottom: 10,
  },
  resultTimer: {
    fontSize: 20,
    color: '#333',
  },
  leaderboardContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  leaderboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  leaderboardEntry: {
    fontSize: 20,
    marginVertical: 4,
  },
  leaderboardEntryContainer: {
    marginVertical: 6,
    alignItems: 'center',
  },
  finalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
});
function setGameTime(arg0: number) {
  throw new Error('Function not implemented.');
}

