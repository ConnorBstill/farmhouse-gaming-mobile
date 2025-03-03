import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Easing,
  SafeAreaView,
  StatusBar,
  Vibration
} from "react-native";

const { width } = Dimensions.get("window");
const GRID_SIZE = 12; // Increased grid size
const CELL_SIZE = Math.floor((width - 40) / GRID_SIZE);
const INITIAL_POSITION = { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) };
const INITIAL_SPEED = 250; // Faster initial speed
const MIN_SPEED = 80; // Maximum speed cap
const SPEED_DECREMENT = 10; // Smaller speed decrease for smoother difficulty curve

// Game states
const GAME_STATES = {
  WELCOME: 'welcome',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameover'
};

// Different food types with points and colors
const FOOD_TYPES = [
  { emoji: '🍎', points: 1, color: '#FF3B30' },
  { emoji: '🍒', points: 2, color: '#FF2D55' },
  { emoji: '🍊', points: 3, color: '#FF9500' },
  { emoji: '🍇', points: 5, color: '#AF52DE' }
];

// Get random position that's not on the snake
const getRandomPosition = (snake) => {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
  
  // Random food type
  const foodType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
  
  return { ...position, ...foodType };
};

const SnakeGame = () => {
  // Game state
  const [gameState, setGameState] = useState(GAME_STATES.WELCOME);
  const [snake, setSnake] = useState([INITIAL_POSITION]);
  const [direction, setDirection] = useState("RIGHT");
  const [nextDirection, setNextDirection] = useState("RIGHT"); // Buffer for next direction
  const [food, setFood] = useState(null);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [foodAnim] = useState(new Animated.Value(1));
  
  // Game loop interval ref
  const gameLoopRef = useRef(null);

  // Initialize food on mount
  useEffect(() => {
    if (!food && (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.WELCOME)) {
      setFood(getRandomPosition(snake));
    }
  }, [food, gameState]);

  // Handle countdown timer
  useEffect(() => {
    if (gameState === GAME_STATES.COUNTDOWN) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState(GAME_STATES.PLAYING);
      }
    }
  }, [countdown, gameState]);

  // Main game loop
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      gameLoopRef.current = setInterval(() => moveSnake(), speed);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [snake, nextDirection, speed, gameState]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Food bobbing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(foodAnim, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(foodAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  // Apply next direction to current direction when moving
  const moveSnake = () => {
    // Apply buffered direction
    setDirection(nextDirection);
    
    let newHead = { ...snake[0] };
    
    // Move head based on direction
    switch (nextDirection) {
      case "UP":
        newHead.y -= 1;
        break;
      case "DOWN":
        newHead.y += 1;
        break;
      case "LEFT":
        newHead.x -= 1;
        break;
      case "RIGHT":
        newHead.x += 1;
        break;
    }

    // Check collision with walls or self
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE ||
      snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      handleGameOver();
      return;
    }

    const newSnake = [newHead, ...snake];
    
    // Check if food is eaten
    if (food && newHead.x === food.x && newHead.y === food.y) {
      // Don't remove tail - snake grows
      setScore(prevScore => prevScore + food.points);
      setFood(getRandomPosition(newSnake));
      
      // Speed up the game
      setSpeed(prevSpeed => Math.max(MIN_SPEED, prevSpeed - SPEED_DECREMENT));
      
      // Provide haptic feedback for food consumption
      Vibration.vibrate(50);
      
      // Scale animation for score
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Remove tail
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  // Buffer the next direction to prevent rapid opposite direction changes
  const changeDirection = (newDirection) => {
    // Prevent 180-degree turns by checking both current and next direction
    if (
      (direction === "UP" && newDirection === "DOWN") ||
      (direction === "DOWN" && newDirection === "UP") ||
      (direction === "LEFT" && newDirection === "RIGHT") ||
      (direction === "RIGHT" && newDirection === "LEFT") ||
      (nextDirection === "UP" && newDirection === "DOWN") ||
      (nextDirection === "DOWN" && newDirection === "UP") ||
      (nextDirection === "LEFT" && newDirection === "RIGHT") ||
      (nextDirection === "RIGHT" && newDirection === "LEFT")
    ) {
      return;
    }
    
    setNextDirection(newDirection);
  };

  // Handle game over
  const handleGameOver = () => {
    setGameState(GAME_STATES.GAME_OVER);
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
    }
    
    // Provide haptic feedback for game over
    Vibration.vibrate([100, 100, 100]);
  };

  // Start a new game
  const startNewGame = () => {
    setSnake([INITIAL_POSITION]);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setSpeed(INITIAL_SPEED);
    setScore(0);
    setFood(null); // Will be set in useEffect
    setCountdown(3);
    setGameState(GAME_STATES.COUNTDOWN);
  };

  // Reset game to welcome screen
  const resetGame = () => {
    setSnake([INITIAL_POSITION]);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setSpeed(INITIAL_SPEED);
    setScore(0);
    setFood(null);
    setGameState(GAME_STATES.WELCOME);
  };

  // Pause/resume game
  const togglePause = () => {
    if (gameState === GAME_STATES.PLAYING) {
      setGameState(GAME_STATES.PAUSED);
      clearInterval(gameLoopRef.current);
    } else if (gameState === GAME_STATES.PAUSED) {
      setGameState(GAME_STATES.PLAYING);
    }
  };

  // Render a snake segment with gradient colors based on position
  const renderSnakeSegment = (index, total) => {
    // Calculate a color that gets lighter toward the tail
    const baseHue = 142; // Green hue
    const lightness = 40 + Math.floor((index / total) * 30);
    const backgroundColor = `hsl(${baseHue}, 90%, ${lightness}%)`;
    
    return backgroundColor;
  };

  // Render the welcome screen
  const renderWelcome = () => (
    <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
      <Text style={styles.gameTitle}>SNAKE</Text>
      <Text style={styles.gameSubtitle}>Classic Game</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.instructionText}>Swipe or tap the directional buttons to move the snake.</Text>
        <Text style={styles.instructionText}>Eat food to grow longer and score points.</Text>
        <Text style={styles.instructionText}>Avoid hitting the walls or yourself!</Text>
      </View>
      
      {highScore > 0 && (
        <View style={styles.scoreContainer}>
          <Text style={styles.highScoreLabel}>HIGH SCORE</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.startButton} 
        onPress={startNewGame}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>START GAME</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render the countdown screen
  const renderCountdown = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.countdownText}>{countdown}</Text>
      <Text style={styles.countdownSubtext}>Get Ready!</Text>
    </View>
  );

  // Render the game over screen
  const renderGameOver = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.gameOverTitle}>GAME OVER</Text>
      
      <View style={styles.scoreBoard}>
        <View style={styles.scoreBoardRow}>
          <Text style={styles.scoreBoardLabel}>SCORE</Text>
          <Text style={styles.scoreBoardValue}>{score}</Text>
        </View>
        
        <View style={styles.scoreBoardRow}>
          <Text style={styles.scoreBoardLabel}>BEST</Text>
          <Text style={styles.scoreBoardValue}>{highScore}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.playAgainButton} 
        onPress={startNewGame}
        activeOpacity={0.8}
      >
        <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={resetGame}
        activeOpacity={0.8}
      >
        <Text style={styles.menuButtonText}>MAIN MENU</Text>
      </TouchableOpacity>
    </View>
  );

  // Render the pause screen
  const renderPaused = () => (
    <View style={styles.pauseOverlay}>
      <View style={styles.pauseContainer}>
        <Text style={styles.pauseTitle}>PAUSED</Text>
        
        <TouchableOpacity 
          style={styles.resumeButton} 
          onPress={togglePause}
          activeOpacity={0.8}
        >
          <Text style={styles.resumeButtonText}>RESUME</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.restartButton} 
          onPress={startNewGame}
          activeOpacity={0.8}
        >
          <Text style={styles.restartButtonText}>RESTART</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quitButton} 
          onPress={resetGame}
          activeOpacity={0.8}
        >
          <Text style={styles.quitButtonText}>QUIT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render the game board and controls
  const renderGame = () => (
    <View style={styles.gameContainer}>
      {/* Header with score and controls */}
      <View style={styles.header}>
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Animated.Text 
            style={[
              styles.scoreValue, 
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {score}
          </Animated.Text>
        </View>
        
        <TouchableOpacity 
          style={styles.pauseButton} 
          onPress={togglePause}
          activeOpacity={0.8}
        >
          <Text style={styles.pauseButtonText}>❙❙</Text>
        </TouchableOpacity>
      </View>
      
      {/* Game grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {Array.from({ length: GRID_SIZE }).map((_, row) => (
            <View key={row} style={styles.row}>
              {Array.from({ length: GRID_SIZE }).map((_, col) => {
                // Find if this cell contains a snake segment
                const segmentIndex = snake.findIndex(
                  segment => segment.x === col && segment.y === row
                );
                const isSnake = segmentIndex !== -1;
                const isHead = segmentIndex === 0;
                const isFood = food && food.x === col && food.y === row;
                
                return (
                  <View 
                    key={col} 
                    style={[
                      styles.cell,
                      isSnake && { 
                        backgroundColor: isHead 
                          ? '#00E676' // Head color
                          : renderSnakeSegment(segmentIndex, snake.length) 
                      },
                      isHead && styles[`head${direction}`] // Apply direction-specific style to head
                    ]}
                  >
                    {isFood && (
                      <Animated.Text 
                        style={[
                          styles.food,
                          { transform: [{ scale: foodAnim }] }
                        ]}
                      >
                        {food.emoji}
                      </Animated.Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={() => changeDirection("UP")} 
          style={[styles.directionButton, styles.upButton]}
        >
          <Text style={styles.directionButtonText}>⬆️</Text>
        </TouchableOpacity>
        
        <View style={styles.horizontalControls}>
          <TouchableOpacity 
            onPress={() => changeDirection("LEFT")} 
            style={[styles.directionButton, styles.leftButton]}
          >
            <Text style={styles.directionButtonText}>⬅️</Text>
          </TouchableOpacity>
          
          <View style={styles.centerPad} />
          
          <TouchableOpacity 
            onPress={() => changeDirection("RIGHT")} 
            style={[styles.directionButton, styles.rightButton]}
          >
            <Text style={styles.directionButtonText}>➡️</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          onPress={() => changeDirection("DOWN")} 
          style={[styles.directionButton, styles.downButton]}
        >
          <Text style={styles.directionButtonText}>⬇️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {gameState === GAME_STATES.WELCOME && renderWelcome()}
      {gameState === GAME_STATES.COUNTDOWN && renderCountdown()}
      {gameState === GAME_STATES.PLAYING && renderGame()}
      {gameState === GAME_STATES.GAME_OVER && renderGameOver()}
      
      {gameState === GAME_STATES.PAUSED && (
        <>
          {renderGame()}
          {renderPaused()}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#00E676",
    marginBottom: 10,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 230, 118, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  gameSubtitle: {
    fontSize: 18,
    color: "#BBBBBB",
    marginBottom: 40
  },
  infoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%'
  },
  instructionText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 10,
    lineHeight: 22
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 40
  },
  highScoreLabel: {
    fontSize: 16,
    color: "#BBBBBB",
    marginBottom: 5
  },
  highScoreValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFD600"
  },
  startButton: {
    backgroundColor: "#00E676",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#00E676",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000"
  },
  countdownText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#FFFFFF"
  },
  countdownSubtext: {
    fontSize: 24,
    color: "#BBBBBB",
    marginTop: 20
  },
  gameOverTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FF3D00",
    marginBottom: 30
  },
  scoreBoard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 40
  },
  scoreBoardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)"
  },
  scoreBoardLabel: {
    fontSize: 16,
    color: "#BBBBBB"
  },
  scoreBoardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF"
  },
  playAgainButton: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    width: '80%',
    alignItems: "center"
  },
  playAgainButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF"
  },
  menuButton: {
    backgroundColor: "transparent",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#BBBBBB",
    width: '80%',
    alignItems: "center"
  },
  menuButtonText: {
    fontSize: 18,
    color: "#BBBBBB"
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center"
  },
  pauseContainer: {
    backgroundColor: "#1E1E1E",
    padding: 30,
    borderRadius: 15,
    width: '80%',
    alignItems: "center"
  },
  pauseTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30
  },
  resumeButton: {
    backgroundColor: "#00E676",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    width: '100%',
    alignItems: "center"
  },
  resumeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000"
  },
  restartButton: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    width: '100%',
    alignItems: "center"
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF"
  },
  quitButton: {
    backgroundColor: "transparent",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#FF3D00",
    width: '100%',
    alignItems: "center"
  },
  quitButtonText: {
    fontSize: 18,
    color: "#FF3D00"
  },
  gameContainer: {
    flex: 1,
    padding: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  scoreDisplay: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center"
  },
  scoreLabel: {
    fontSize: 12,
    color: "#BBBBBB",
    marginBottom: 5
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF"
  },
  pauseButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center"
  },
  pauseButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF"
  },
  gridContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  grid: {
    borderWidth: 2,
    borderColor: "#333333",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1A1A1A"
  },
  row: {
    flexDirection: "row"
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: "#222222",
    justifyContent: "center",
    alignItems: "center"
  },
  headUP: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  headDOWN: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  headLEFT: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8
  },
  headRIGHT: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  },
  food: {
    fontSize: CELL_SIZE * 0.7
  },
  controls: {
    alignItems: "center",
    marginTop: 20
  },
  horizontalControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '80%',
    marginVertical: 10
  },
  directionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },
  upButton: {
    marginBottom: 10
  },
  downButton: {
    marginTop: 10
  },
  leftButton: {},
  rightButton: {},
  centerPad: {
    width: 70
  },
  directionButtonText: {
    fontSize: 24
  }
});

export default SnakeGame;