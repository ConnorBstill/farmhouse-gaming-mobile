import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from "react-native";

type Question = {
  num1: number;
  num2: number;
  operator: "+" | "-";
  answer: number;
};

type GameStep = "welcome" | "countdown" | "question" | "feedback" | "results";

const { width, height } = Dimensions.get("window");
const TOTAL_QUESTIONS = 10; // Increased from 5 to 10 questions

const MathGame: React.FC = () => {
  // Game state
  const [step, setStep] = useState<GameStep>("welcome");
  const [countdown, setCountdown] = useState(3);
  const [question, setQuestion] = useState<Question>({
    num1: 0,
    num2: 0,
    operator: "+",
    answer: 0,
  });
  const [userAnswer, setUserAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(15); // Seconds per question
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [animatedValue] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [progressWidth] = useState(new Animated.Value(0));
  const [results, setResults] = useState<Array<{ question: Question; userAnswer: string; correct: boolean }>>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      min1: 1, max1: 10,
      min2: 1, max2: 10,
      time: 15
    },
    medium: {
      min1: 10, max1: 50,
      min2: 1, max2: 20,
      time: 12
    },
    hard: {
      min1: 20, max1: 99,
      min2: 5, max2: 50,
      time: 10
    }
  };

  // Countdown effect
  useEffect(() => {
    if (step === "countdown") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            startGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Animation for feedback
  useEffect(() => {
    if (step === "feedback") {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step]);

  // Reset timer when question changes
  useEffect(() => {
    if (step === "question") {
      // Focus on input when new question appears
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      // Start question timer
      startQuestionTimer();
      
      // Reset and start progress bar animation
      progressWidth.setValue(0);
      Animated.timing(progressWidth, {
        toValue: width - 40, // Full width minus padding
        duration: timePerQuestion * 1000,
        useNativeDriver: false,
      }).start();
    }
    
    return () => {
      // Clear timers when component unmounts or question changes
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
    };
  }, [question, step]);

  // Start the question timer
  const startQuestionTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set new timer
    timerRef.current = setTimeout(() => {
      // Time's up - mark as incorrect
      handleTimeUp();
    }, timePerQuestion * 1000);
  };

  // Handle when time runs out
  const handleTimeUp = () => {
    setFeedbackMessage("Time's up!");
    updateResults(false);
    setStreakCount(0); // Reset streak
    showFeedback(false);
  };

  // Start the game
  const startGame = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setResults([]);
    setStreakCount(0);
    setStep("question");
    
    // Set time per question based on difficulty
    setTimePerQuestion(difficultySettings[difficulty].time);
    
    generateQuestion();
  };

  // Generate a new math question
  const generateQuestion = () => {
    const settings = difficultySettings[difficulty];
    
    const randomNumber = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    let n1 = randomNumber(settings.min1, settings.max1);
    let n2 = randomNumber(settings.min2, settings.max2);
    let operator: "+" | "-" = Math.random() < 0.5 ? "+" : "-";
    
    // Ensure no negative answers for subtraction
    if (operator === "-" && n2 > n1) {
      // Swap numbers to ensure positive result
      [n1, n2] = [n2, n1];
    }
    
    const answer = operator === "+" ? n1 + n2 : n1 - n2;
    
    setQuestion({ num1: n1, num2: n2, operator, answer });
    setUserAnswer("");
  };

  // Handle answer submission
  const handleSubmit = () => {
    // Clear the timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Parse the user's answer
    const parsed = parseInt(userAnswer, 10);
    
    // Check if answer is correct
    const isCorrect = !isNaN(parsed) && parsed === question.answer;
    
    // Update results and score
    updateResults(isCorrect);
    
    // Update streak
    if (isCorrect) {
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      
      // Update best streak if needed
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      
      setFeedbackMessage("Correct!");
    } else {
      setStreakCount(0); // Reset streak
      setFeedbackMessage("Incorrect!");
    }
    
    // Show feedback
    showFeedback(isCorrect);
    
    // Dismiss keyboard
    Keyboard.dismiss();
  };
  
  // Update results array
  const updateResults = (isCorrect: boolean) => {
    setResults(prev => [
      ...prev, 
      { 
        question: question, 
        userAnswer: userAnswer || "No answer", 
        correct: isCorrect 
      }
    ]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };
  
  // Show feedback and then move to next question or results
  const showFeedback = (isCorrect: boolean) => {
    // Animate the scale for feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setStep("feedback");
    
    // Move to next question or show results after feedback
    setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex >= TOTAL_QUESTIONS) {
        setStep("results");
      } else {
        setCurrentQuestionIndex(nextQuestionIndex);
        setStep("question");
        generateQuestion();
      }
    }, 1500);
  };

  // Restart game
  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setStep("countdown");
    setCountdown(3);
  };

  // Change difficulty
  const changeDifficulty = (newDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty);
    setTimePerQuestion(difficultySettings[newDifficulty].time);
  };

  // Return to main menu (in a real app, would trigger navigation)
  const returnToMainMenu = () => {
    setStep("welcome");
  };

  // Render welcome screen
  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.gameTitle}>MATH MASTER</Text>
      <Text style={styles.gameSubtitle}>Test your math skills!</Text>
      
      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyLabel}>SELECT DIFFICULTY:</Text>
        <View style={styles.difficultyButtons}>
          <TouchableOpacity 
            style={[
              styles.difficultyButton, 
              difficulty === "easy" && styles.selectedDifficulty,
              { backgroundColor: "rgba(76, 175, 80, 0.3)" }
            ]}
            onPress={() => changeDifficulty("easy")}
          >
            <Text style={[
              styles.difficultyButtonText,
              difficulty === "easy" && styles.selectedDifficultyText
            ]}>
              EASY
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.difficultyButton, 
              difficulty === "medium" && styles.selectedDifficulty,
              { backgroundColor: "rgba(255, 152, 0, 0.3)" }
            ]}
            onPress={() => changeDifficulty("medium")}
          >
            <Text style={[
              styles.difficultyButtonText,
              difficulty === "medium" && styles.selectedDifficultyText
            ]}>
              MEDIUM
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.difficultyButton, 
              difficulty === "hard" && styles.selectedDifficulty,
              { backgroundColor: "rgba(244, 67, 54, 0.3)" }
            ]}
            onPress={() => changeDifficulty("hard")}
          >
            <Text style={[
              styles.difficultyButtonText,
              difficulty === "hard" && styles.selectedDifficultyText
            ]}>
              HARD
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>HOW TO PLAY:</Text>
        <Text style={styles.instructionsText}>• Solve {TOTAL_QUESTIONS} math problems</Text>
        <Text style={styles.instructionsText}>• Answer within the time limit</Text>
        <Text style={styles.instructionsText}>• Get as many correct as possible</Text>
      </View>
      
      {bestStreak > 0 && (
        <View style={styles.bestStreakContainer}>
          <Text style={styles.bestStreakLabel}>BEST STREAK</Text>
          <Text style={styles.bestStreakValue}>{bestStreak}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => setStep("countdown")}
      >
        <Text style={styles.startButtonText}>START GAME</Text>
      </TouchableOpacity>
    </View>
  );

  // Render countdown screen
  const renderCountdown = () => (
    <View style={styles.countdownContainer}>
      <Text style={styles.countdownText}>{countdown}</Text>
      <Text style={styles.countdownLabel}>
        Get Ready!
      </Text>
    </View>
  );

  // Render question screen
  const renderQuestion = () => (
    <View style={styles.questionContainer}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}
        </Text>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              { width: progressWidth }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.scoreRow}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        
        {streakCount > 1 && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>STREAK</Text>
            <Text style={styles.streakValue}>{streakCount}🔥</Text>
          </View>
        )}
      </View>
      
      <View style={styles.mathProblemCard}>
        <Text style={styles.questionText}>
          {question.num1} {question.operator} {question.num2} = ?
        </Text>
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={userAnswer}
          onChangeText={setUserAnswer}
          keyboardType="numeric"
          placeholder="Your answer"
          placeholderTextColor="#9E9E9E"
          maxLength={5}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          autoFocus
        />
        
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render feedback screen
  const renderFeedback = () => {
    const isCorrect = feedbackMessage === "Correct!";
    
    return (
      <Animated.View 
        style={[
          styles.feedbackContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: isCorrect 
              ? "rgba(76, 175, 80, 0.9)" 
              : "rgba(244, 67, 54, 0.9)"
          }
        ]}
      >
        <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        
        <View style={styles.answerContainer}>
          <Text style={styles.correctAnswerLabel}>
            {isCorrect ? "Your answer:" : "Correct answer:"}
          </Text>
          <Text style={styles.correctAnswerText}>
            {isCorrect ? userAnswer : question.answer}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // Render results screen
  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>GAME OVER</Text>
      
      <View style={styles.scoreSummaryContainer}>
        <View style={styles.finalScoreContainer}>
          <Text style={styles.finalScoreLabel}>FINAL SCORE</Text>
          <Text style={styles.finalScoreValue}>{score}</Text>
          <Text style={styles.outOfText}>out of {TOTAL_QUESTIONS}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round((score / TOTAL_QUESTIONS) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.playAgainButton]} 
          onPress={restartGame}
        >
          <Text style={styles.actionButtonText}>PLAY AGAIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.menuButton]} 
          onPress={returnToMainMenu}
        >
          <Text style={styles.actionButtonText}>MENU</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsList}>
        <Text style={styles.resultsListTitle}>QUESTIONS SUMMARY</Text>
        
        {results.map((result, index) => (
          <View 
            key={index} 
            style={[
              styles.resultItem,
              result.correct 
                ? styles.correctResultItem 
                : styles.incorrectResultItem
            ]}
          >
            <Text style={styles.resultQuestion}>
              {result.question.num1} {result.question.operator} {result.question.num2} = {result.question.answer}
            </Text>
            <Text style={styles.resultAnswer}>
              Your answer: {result.userAnswer}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Main render function
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {step === "welcome" && renderWelcome()}
      {step === "countdown" && renderCountdown()}
      {step === "question" && renderQuestion()}
      {step === "feedback" && renderFeedback()}
      {step === "results" && renderResults()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A237E", // Deep blue background
  },
  
  // Welcome screen styles
  welcomeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  gameSubtitle: {
    fontSize: 18,
    color: "#B3E5FC",
    marginBottom: 40,
    textAlign: "center",
  },
  difficultyContainer: {
    width: "100%",
    marginBottom: 30,
  },
  difficultyLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  difficultyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  difficultyButton: {
    flex: 1,
    padding: 15,
    margin: 5,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedDifficulty: {
    borderColor: "#FFFFFF",
    borderWidth: 2,
  },
  difficultyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  selectedDifficultyText: {
    color: "#FFFFFF",
  },
  instructionsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: "100%",
  },
  instructionsTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 10,
    fontWeight: "bold",
  },
  instructionsText: {
    fontSize: 16,
    color: "#B3E5FC",
    marginVertical: 5,
  },
  bestStreakContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  bestStreakLabel: {
    fontSize: 16,
    color: "#FFD54F",
    marginBottom: 5,
  },
  bestStreakValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFD54F",
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  
  // Countdown screen styles
  countdownContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownText: {
    fontSize: 100,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  countdownLabel: {
    fontSize: 24,
    color: "#B3E5FC",
    marginTop: 20,
  },
  
  // Question screen styles
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 16,
    color: "#B3E5FC",
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FF9800",
    borderRadius: 4,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  scoreContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    minWidth: 100,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#B3E5FC",
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  streakContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.3)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    minWidth: 100,
  },
  streakLabel: {
    fontSize: 14,
    color: "#B3E5FC",
    marginBottom: 5,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  mathProblemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  questionText: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 60,
    borderColor: "#E0E0E0",
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 28,
    color: "#1A237E",
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "#F5F5F5",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  
  // Feedback screen styles
  feedbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  feedbackText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    textAlign: "center",
  },
  answerContainer: {
    alignItems: "center",
  },
  correctAnswerLabel: {
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  correctAnswerText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  
  // Results screen styles
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
  },
  scoreSummaryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  finalScoreContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  finalScoreLabel: {
    fontSize: 16,
    color: "#B3E5FC",
    marginBottom: 5,
  },
  finalScoreValue: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  outOfText: {
    fontSize: 16,
    color: "#B3E5FC",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#B3E5FC",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    margin: 5,
  },
  playAgainButton: {
    backgroundColor: "#4CAF50",
  },
  menuButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultsList: {
    flex: 1,
  },
  resultsListTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  resultItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  correctResultItem: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
  },
  incorrectResultItem: {
    backgroundColor: "rgba(244, 67, 54, 0.3)",
  },
  resultQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  resultAnswer: {
    fontSize: 14,
    color: "#B3E5FC",
  },
});

export default MathGame;