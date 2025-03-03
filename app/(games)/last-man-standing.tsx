import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';

type GamePhase = 'setup' | 'input' | 'result' | 'finished';

interface Player {
  id: number;
  name: string;
  survivedRounds: number;
  eliminated: boolean;
  // You can also record the round at which they were eliminated if desired.
}

export default function App() {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [numPlayers, setNumPlayers] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentRange, setCurrentRange] = useState<number>(10);
  // We'll only process players that are not eliminated.
  const activePlayers = players.filter(p => !p.eliminated);
  // To record choices for the current round, keyed by player id.
  const [choices, setChoices] = useState<{ [id: number]: number }>({});
  // To track which active player's turn it is (index into activePlayers).
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  // The randomly chosen elimination number for the round.
  const [elimNumber, setElimNumber] = useState<number | null>(null);

  // --- SETUP PHASE ---
  // The user inputs a number (1-10) for how many players. Then we create an array of players.
  const startGame = () => {
    if (numPlayers < 1 || numPlayers > 10) return;
    const initialPlayers: Player[] = [];
    for (let i = 0; i < numPlayers; i++) {
      initialPlayers.push({
        id: i,
        name: `Player ${i + 1}`,
        survivedRounds: 0,
        eliminated: false,
      });
    }
    setPlayers(initialPlayers);
    // Reset round variables.
    setCurrentRound(1);
    setCurrentRange(10);
    setChoices({});
    setCurrentPlayerIndex(0);
    setElimNumber(null);
    setPhase('input');
  };

  // --- INPUT PHASE ---
  // In this phase, each active player (in turn) chooses a number from 1 to currentRange.
  const handlePlayerChoice = (choice: number) => {
    const player = activePlayers[currentPlayerIndex];
    setChoices(prev => ({ ...prev, [player.id]: choice }));
    // Move to next active player.
    if (currentPlayerIndex + 1 < activePlayers.length) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      // All active players have chosen. Process round.
      processRound();
    }
  };

  // Process round results by randomly choosing an elimination number.
  const processRound = () => {
    const randomNum = Math.floor(Math.random() * currentRange) + 1;
    setElimNumber(randomNum);

    // Create a new players array with updated statuses.
    const updatedPlayers = players.map(player => {
      if (player.eliminated) return player;
      // Only active players have a choice recorded.
      if (choices[player.id] === randomNum) {
        // Player is eliminated.
        return { ...player, eliminated: true };
      } else {
        // Player survives; increment survival count.
        return { ...player, survivedRounds: player.survivedRounds + 1 };
      }
    });
    setPlayers(updatedPlayers);
    setPhase('result');
  };

  // --- RESULT PHASE ---
  // In this phase, we show the randomly chosen elimination number and which players were eliminated.
  const nextRound = () => {
    // Check game end conditions:
    const survivors = updatedActivePlayers();
    if (survivors.length <= 1) {
      setPhase('finished');
      return;
    }
    // Decrease the range by one (if possible) for the next round.
    setCurrentRange(prev => (prev > 1 ? prev - 1 : 1));
    // Prepare for next round.
    setCurrentRound(currentRound + 1);
    setChoices({});
    setCurrentPlayerIndex(0);
    setElimNumber(null);
    setPhase('input');
  };

  const updatedActivePlayers = () => players.filter(p => !p.eliminated);

  // --- FINISHED PHASE ---
  // In the finished phase, display the leaderboard (sorted by survivedRounds descending).
  const restartGame = () => {
    // Reset all state.
    setPhase('setup');
    setNumPlayers(0);
    setPlayers([]);
    setCurrentRound(1);
    setCurrentRange(10);
    setChoices({});
    setCurrentPlayerIndex(0);
    setElimNumber(null);
  };

  // --- RENDERING FUNCTIONS ---

  // Setup Screen
  const renderSetup = () => (
    <View style={styles.centered}>
      <Text style={styles.title}>Last Man Standing - Number Edition</Text>
      <Text style={styles.instruction}>Enter number of players (1-10):</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={numPlayers ? numPlayers.toString() : ''}
        onChangeText={text => {
          const n = parseInt(text, 10);
          if (!isNaN(n)) setNumPlayers(n);
          else setNumPlayers(0);
        }}
      />
      <Button title="Start Game" onPress={startGame} />
    </View>
  );

  // Input Screen: current active player's turn to choose a number.
  const renderInput = () => {
    // Get the active player whose turn it is.
    const currentPlayer = activePlayers[currentPlayerIndex];
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Round {currentRound}</Text>
        <Text style={styles.instruction}>
          Choose a number between 1 and {currentRange}
        </Text>
        <Text style={styles.instruction}>
          {currentPlayer.name}'s turn:
        </Text>
        <View style={styles.buttonRow}>
          {Array.from({ length: currentRange }, (_, i) => i + 1).map(num => (
            <TouchableOpacity
              key={num}
              style={styles.choiceButton}
              onPress={() => handlePlayerChoice(num)}
            >
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.progress}>
          {currentPlayerIndex + 1} of {activePlayers.length} players have chosen.
        </Text>
      </View>
    );
  };

  // Result Screen: Show the elimination number and the outcome for each player.
  const renderResult = () => {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Round {currentRound} Results</Text>
        <Text style={styles.instruction}>
          Elimination Number: {elimNumber}
        </Text>
        <FlatList
          style={{ width: '100%' }}
          data={players}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            let status = '';
            if (item.eliminated) {
              status = 'ELIMINATED';
            } else {
              // Only players who took part in the round and survived get a round increment.
              status = 'Survived';
            }
            return (
              <View style={styles.playerRow}>
                <Text style={styles.playerText}>
                  {item.name}: {status} (Rounds: {item.survivedRounds})
                </Text>
              </View>
            );
          }}
        />
        <Button title="Next Round" onPress={nextRound} />
      </View>
    );
  };

  // Finished Screen: Show leaderboard based on rounds survived.
  const renderFinished = () => {
    const sortedPlayers = [...players].sort(
      (a, b) => b.survivedRounds - a.survivedRounds
    );
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Game Over</Text>
        {updatedActivePlayers().length === 1 ? (
          <Text style={styles.instruction}>
            Winner: {updatedActivePlayers()[0].name}
          </Text>
        ) : (
          <Text style={styles.instruction}>No clear winner</Text>
        )}
        <Text style={styles.subtitle}>Leaderboard:</Text>
        <FlatList
          style={{ width: '100%' }}
          data={sortedPlayers}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.playerRow}>
              <Text style={styles.playerText}>
                {index + 1}. {item.name} – Rounds Survived: {item.survivedRounds}
              </Text>
            </View>
          )}
        />
        <Button title="Restart Game" onPress={restartGame} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {phase === 'setup'
        ? renderSetup()
        : phase === 'input'
        ? renderInput()
        : phase === 'result'
        ? renderResult()
        : renderFinished()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef',
    padding: 20,
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 22,
    marginVertical: 10,
  },
  instruction: {
    fontSize: 18,
    marginVertical: 5,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    width: '50%',
    height: 40,
    textAlign: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  choiceButton: {
    backgroundColor: '#48a',
    padding: 15,
    margin: 5,
    borderRadius: 5,
    minWidth: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  progress: {
    marginTop: 10,
    fontSize: 16,
  },
  playerRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
  playerText: {
    fontSize: 18,
  },
});

