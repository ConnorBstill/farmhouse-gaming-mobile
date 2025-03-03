import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';

type Move = 'rock' | 'paper' | 'scissors';

type Player = {
  id: string;
  name: string;
  isUser: boolean;
};

type RoundResult = 'win' | 'lose' | 'tie';

const movesEmoji: Record<Move, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

const moveColors: Record<Move, string> = {
  rock: '#E67E22', // Orange
  paper: '#3498DB', // Blue
  scissors: '#9B59B6', // Purple
};

const resultColors: Record<RoundResult, string> = {
  win: '#2ECC71', // Green
  lose: '#E74C3C', // Red
  tie: '#F1C40F', // Yellow
};

const DEVICE_WIDTH = Dimensions.get('window').width;
const EMOJI_SIZE = 80; // Increased emoji size
const BATTLE_ANIMATION_DURATION = 1500; // ms

// Podium Screen Component
type PodiumScreenProps = {
  ranking: Player[];
  onRestart: () => void;
};

const PodiumScreen: React.FC<PodiumScreenProps> = ({ ranking, onRestart }) => {
  // Animation values for each podium position
  const animations = useRef(ranking.map(() => new Animated.Value(0))).current;
  
  useEffect(() => {
    // Animate each podium entry sequentially with delays
    const animations = ranking.map((_, index): any => {
      return Animated.timing(animations[index], {
        toValue: 1,
        duration: 600,
        delay: index * 300,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      });
    });
    
    Animated.sequence(animations).start();
  }, []);
  
  // Medal emojis for top positions
  const getMedal = (position: number) => {
    switch(position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  return (
    <View style={styles.podiumContainer}>
      <Text style={styles.podiumTitle}>Tournament Podium</Text>
      
      {ranking.map((player, index) => (
        <Animated.View 
          key={player.id} 
          style={[
            styles.podiumItem,
            { 
              transform: [
                { translateY: animations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  }) 
                },
                { scale: animations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1]
                  })
                }
              ],
              opacity: animations[index]
            }
          ]}
        >
          <View style={[styles.podiumRankContainer, {
            backgroundColor: index === 0 ? '#F1C40F' : index === 1 ? '#BDC3C7' : index === 2 ? '#CD7F32' : '#34495E'
          }]}>
            <Text style={styles.podiumRank}>{index + 1}</Text>
          </View>
          <Text style={styles.podiumName}>{player.name} {getMedal(index)}</Text>
        </Animated.View>
      ))}
      
      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={onRestart}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>🔄 Play Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const RockPaperScissorsGame: React.FC = () => {
  // Initial tournament players: user and three computer opponents.
  const initialPlayers: Player[] = [
    { id: 'user', name: 'You', isUser: true },
    { id: 'cpu1', name: '🤖1', isUser: false },
    { id: 'cpu2', name: '🤖2', isUser: false },
    { id: 'cpu3', name: '🤖3', isUser: false },
  ];

  // State to track active players
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  // Mapping of player id to the move chosen in the current round.
  const [roundMoves, setRoundMoves] = useState<Record<string, Move | null>>({});
  // Animated values for each player's emoji during the round.
  const [animatedValues, setAnimatedValues] = useState<
    Record<string, { x: Animated.Value; y: Animated.Value; rotate: Animated.Value; scale: Animated.Value; opacity: Animated.Value }>
  >({});
  // Message to show round information and instructions.
  const [roundMessage, setRoundMessage] = useState<string>('Make your move!');
  // User's overall points.
  const [userScore, setUserScore] = useState<number>(0);
  // Store eliminated players (in order of elimination) for podium ranking.
  const [eliminatedPlayers, setEliminatedPlayers] = useState<Player[]>([]);
  // Flag for when the tournament is over.
  const [tournamentOver, setTournamentOver] = useState<boolean>(false);
  // Round result for the user
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  // Animation state
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Shake animation ref for the title
  const titleShakeAnim = useRef(new Animated.Value(0)).current;

  // Helper: randomly pick a move for computer players.
  const getRandomMove = (): Move => {
    const moves: Move[] = ['rock', 'paper', 'scissors'];
    return moves[Math.floor(Math.random() * moves.length)];
  };

  // Given an array of moves, determine the winning move.
  // Returns null if the moves result in a tie.
  const getWinningMove = (moves: Move[]): Move | null => {
    const uniqueMoves = Array.from(new Set(moves));
    if (uniqueMoves.length === 1) return null; // All players chose the same move.
    if (uniqueMoves.length === 3) return null; // All moves present → tie.
    // When only two moves are present, determine the winning move.
    if (uniqueMoves.includes('rock') && uniqueMoves.includes('paper')) return 'paper';
    if (uniqueMoves.includes('rock') && uniqueMoves.includes('scissors')) return 'rock';
    if (uniqueMoves.includes('paper') && uniqueMoves.includes('scissors')) return 'scissors';
    return null;
  };

  // Shake the title for dramatic effect
  const shakeTitle = () => {
    titleShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(titleShakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(titleShakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(titleShakeAnim, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(titleShakeAnim, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(titleShakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Called when the user selects a move.
  const handleUserMove = (move: Move) => {
    if (isAnimating) return; // Prevent multiple moves during animation
    setIsAnimating(true);
    shakeTitle();
    
    // Record the user's move.
    const newRoundMoves: Record<string, Move | null> = { ...roundMoves, user: move };
    // For every computer player, generate a random move.
    players.forEach((player) => {
      if (!player.isUser) {
        newRoundMoves[player.id] = getRandomMove();
      }
    });
    setRoundMoves(newRoundMoves);

    // Initialize animated values for each player
    const initialAnimatedValues: Record<string, { x: Animated.Value; y: Animated.Value; rotate: Animated.Value; scale: Animated.Value; opacity: Animated.Value }> = {};
    players.forEach((player, index) => {
      // Position moves at the bottom for user, evenly distributed at top for CPU players
      const playerCount = players.length;
      const isUser = player.isUser;
      
      // Calculate initial positions
      let initialX;
      let initialY;
      
      if (isUser) {
        // User at bottom center
        initialX = DEVICE_WIDTH / 2 - EMOJI_SIZE / 2;
        initialY = new Animated.Value(300); // Starting below the screen
      } else {
        // CPUs at top, distributed evenly
        const cpuPlayers = players.filter(p => !p.isUser);
        const cpuIndex = cpuPlayers.findIndex(p => p.id === player.id);
        const cpuCount = cpuPlayers.length;
        
        initialX = (cpuIndex + 1) * (DEVICE_WIDTH / (cpuCount + 1)) - EMOJI_SIZE / 2;
        initialY = new Animated.Value(-100); // Starting above the screen
      }
      
      initialAnimatedValues[player.id] = {
        x: new Animated.Value(initialX),
        y: initialY,
        rotate: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      };
    });
    setAnimatedValues(initialAnimatedValues);

    // Determine winning move
    const movesChosen = players.map((player) => newRoundMoves[player.id]) as Move[];
    const winningMove = getWinningMove(movesChosen);
    
    // Determine user's result for this round
    if (winningMove === null) {
      setRoundResult('tie');
    } else if (newRoundMoves.user === winningMove) {
      setRoundResult('win');
    } else {
      setRoundResult('lose');
    }

    // Create appearance animations
    const appearAnimations = players.map(player => {
      return Animated.parallel([
        Animated.timing(initialAnimatedValues[player.id].opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(initialAnimatedValues[player.id].scale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(initialAnimatedValues[player.id].y, {
          toValue: player.isUser ? 200 : 80,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(initialAnimatedValues[player.id].rotate, {
          toValue: player.isUser ? 0 : (Math.random() * 40 - 20), // Random slight rotation for CPU
          duration: 400,
          useNativeDriver: true,
        })
      ]);
    });
    
    // Start the appearance animations
    Animated.stagger(100, appearAnimations).start(() => {
      // After all moves appear, animate battle
      const centerX = DEVICE_WIDTH / 2 - EMOJI_SIZE / 2;
      const centerY = 140;
      
      const battleAnimations = players.map(player => {
        const isWinner = newRoundMoves[player.id] === winningMove;
        const isLoser = winningMove !== null && newRoundMoves[player.id] !== winningMove;
        
        return Animated.sequence([
          // First move all to center with rotation
          Animated.parallel([
            Animated.timing(initialAnimatedValues[player.id].x, {
              toValue: centerX + (Math.random() * 20 - 10), // Slight random offset
              duration: BATTLE_ANIMATION_DURATION,
              easing: Easing.elastic(1),
              useNativeDriver: true,
            }),
            Animated.timing(initialAnimatedValues[player.id].y, {
              toValue: centerY + (Math.random() * 20 - 10), // Slight random offset
              duration: BATTLE_ANIMATION_DURATION,
              easing: Easing.elastic(1),
              useNativeDriver: true,
            }),
            Animated.timing(initialAnimatedValues[player.id].rotate, {
              toValue: Math.random() * 360, // Random full rotation
              duration: BATTLE_ANIMATION_DURATION,
              useNativeDriver: true,
            })
          ]),
          // Then handle the outcome
          Animated.parallel([
            // Scale winners up, losers down
            Animated.timing(initialAnimatedValues[player.id].scale, {
              toValue: isWinner ? 1.3 : 0.7,
              duration: 500,
              useNativeDriver: true,
            }),
            // Fade out losers
            Animated.timing(initialAnimatedValues[player.id].opacity, {
              toValue: isLoser ? 0.3 : 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ]);
      });
      
      Animated.stagger(50, battleAnimations).start(() => {
        // After animation completes, update game state
        if (winningMove === null) {
          // Tie round: prompt to select again.
          setRoundMessage(`It's a tie! Choose again.`);
          setTimeout(() => {
            setRoundMoves({});
            setAnimatedValues({});
            setIsAnimating(false);
          }, 1500);
          return;
        }

        // Identify winners and losers.
        const winners = players.filter((player) => newRoundMoves[player.id] === winningMove);
        const losers = players.filter((player) => newRoundMoves[player.id] !== winningMove);

        // Update eliminated players and active players.
        setEliminatedPlayers((prev) => [...prev, ...losers]);
        
        if (winners.length === 1) {
          // Tournament over.
          if (winners[0].isUser) {
            setUserScore(userScore + 1);
            setTimeout(() => {
              Alert.alert("🏆 Tournament Winner", "You win the tournament!");
              setPlayers(winners);
              setTournamentOver(true);
            }, 1000);
          } else {
            setTimeout(() => {
              Alert.alert("🏆 Tournament Winner", `${winners[0].name} wins the tournament.`);
              setPlayers(winners);
              setTournamentOver(true);
            }, 1000);
          }
        } else {
          // Continue tournament with winners.
          setTimeout(() => {
            setPlayers(winners);
            setRoundMessage(`Winners: ${winners.map((p) => p.name).join(', ')}. Choose again.`);
            setRoundMoves({});
            setAnimatedValues({});
            setIsAnimating(false);
          }, 1500);
        }
      });
    });
  };

  // Reset the game back to the initial state.
  const resetGame = () => {
    setPlayers(initialPlayers);
    setRoundMoves({});
    setRoundMessage("Make your move!");
    setUserScore(0);
    setEliminatedPlayers([]);
    setTournamentOver(false);
    setAnimatedValues({});
    setRoundResult(null);
    setIsAnimating(false);
  };

  // Compute ranking for podium: champion first, then eliminated players in reverse order.
  const ranking: Player[] = tournamentOver ? [players[0], ...[...eliminatedPlayers].reverse()] : [];

  // Render animated round moves if roundMoves exist.
  const renderRoundAnimation = () => {
    return (
      <View style={styles.animationContainer}>
        {players.map((player) => {
          const move = roundMoves[player.id];
          if (!move || !animatedValues[player.id]) return null;
          
          return (
            <Animated.View
              key={player.id}
              style={[
                styles.animatedEmoji,
                {
                  transform: [
                    { translateX: animatedValues[player.id].x },
                    { translateY: animatedValues[player.id].y },
                    { rotate: animatedValues[player.id].rotate.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg']
                      })
                    },
                    { scale: animatedValues[player.id].scale }
                  ],
                  opacity: animatedValues[player.id].opacity,
                  backgroundColor: moveColors[move],
                },
              ]}
            >
              <Text style={styles.emojiText}>{movesEmoji[move]}</Text>
              <Text style={styles.playerIndicator}>{player.name}</Text>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  if (tournamentOver) {
    return <PodiumScreen ranking={ranking} onRestart={resetGame} />;
  }

  return (
    <View style={styles.container}>
      <Animated.Text 
        style={[
          styles.title,
          {transform: [{translateX: titleShakeAnim}]}
        ]}
      >
        Rock Paper Scissors Tournament
      </Animated.Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>Your Points: {userScore}</Text>
        {roundResult && (
          <View style={[styles.resultBadge, {backgroundColor: resultColors[roundResult]}]}>
            <Text style={styles.resultText}>
              {roundResult === 'win' ? '🎉 WIN' : roundResult === 'lose' ? '❌ LOSE' : '🔄 TIE'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{roundMessage}</Text>
      </View>
      
      {/* During a round animation, display the sliding emojis. */}
      {Object.keys(roundMoves).length > 0 ? (
        renderRoundAnimation()
      ) : (
        <View style={styles.playersContainer}>
          {players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.player}>
                {player.name}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Only show move buttons if the user is still in the tournament and no round animation is playing. */}
      {players.some((player) => player.isUser) &&
        Object.keys(roundMoves).length === 0 && (
          <View style={styles.buttonsContainer}>
            {['rock', 'paper', 'scissors'].map((move) => (
              <TouchableOpacity 
                key={move}
                onPress={() => handleUserMove(move as Move)} 
                style={[styles.moveButton, {backgroundColor: moveColors[move as Move]}]}
                activeOpacity={0.7}
                disabled={isAnimating}
              >
                <Text style={styles.buttonText}>{movesEmoji[move as Move]}</Text>
                <Text style={styles.moveText}>{move}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
      <TouchableOpacity 
        onPress={resetGame} 
        style={styles.resetButton}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>🔄 Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RockPaperScissorsGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 10,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  score: {
    fontSize: 18,
    color: '#FFF',
    marginRight: 10,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  message: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
  playersContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    minWidth: 50,
    alignItems: 'center',
  },
  player: {
    fontSize: 18,
    color: '#FFF',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  moveButton: {
    padding: 12,
    margin: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    minWidth: 80,
  },
  buttonText: {
    fontSize: 32,
    color: '#FFF',
  },
  moveText: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  resetButton: {
    backgroundColor: '#E53935',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  // Animation container for sliding emojis.
  animationContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    marginVertical: 20,
  },
  animatedEmoji: {
    position: 'absolute',
    width: EMOJI_SIZE,
    height: EMOJI_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  emojiText: {
    fontSize: 36,
  },
  playerIndicator: {
    position: 'absolute',
    bottom: 2,
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  // Podium screen styles.
  podiumContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  podiumTitle: {
    fontSize: 32,
    color: '#FFF',
    marginBottom: 30,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  podiumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    paddingVertical: 12,
    width: '80%',
  },
  podiumRankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  podiumRank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  podiumName: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
});