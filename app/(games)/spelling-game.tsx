import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// Letter sets to choose from (each includes at least 3 vowels)
const LETTER_SETS = [
  ["A", "E", "I", "R", "T", "L", "S"], // Original set
  ["A", "E", "O", "N", "D", "T", "P"],
  ["E", "I", "O", "M", "C", "H", "S"],
  ["A", "I", "U", "B", "F", "K", "R"],
  ["E", "O", "U", "G", "L", "W", "Y"]
];

// Randomly select a letter set when the component loads
const getRandomLetterSet = () => {
  const randomIndex = Math.floor(Math.random() * LETTER_SETS.length);
  return LETTER_SETS[randomIndex];
};

// The current set of allowed letters
const ALLOWED_LETTERS = getRandomLetterSet();

// A comprehensive dictionary of valid words (all uppercase) that can be made with the allowed letters.
const DICTIONARY = new Set([
  // Original set (A, E, I, R, T, L, S)
  "ART", "TAR", "RAT", "STAR", "TSAR", "TEAR", "RATE", "TIER",
  "LATE", "REAL", "TAIL", "LIST", "SALT", "RAIL", "ALERT", "ALTER",
  "LATER", "STARE", "RETAIL", "SLATE", "TRAIL", "ISLE", "SIRE",
  "LIT", "LET", "SET", "SIR", "ITS", "TASTE", "EAST", "SEAT", "TEAL", "LEAST",
  "RAISE", "STAIR", "TALES", "ARISE", "SALE", "SAIL", "REST", "LAST", "STEAL",
  "STALE", "TESLA", "LEAST", "TRIAL", "ARTIST", "LITER", "STILT", "STRIAE", 
  "SALTER", "TAILER", "RETAILS", "RELATE", "ESTERASE", "SERIALIST", "SALTIER",
  "SEA", "TEA", "ATE", "EAT", "SAT", "SIT", "AIR", "EAR", "ARE", "TAILS", "TILES",
  "TIRES", "TRIES", "LASER", "SLATER", "EASTER", "RATES", "TEALS", "TEARS", "LAIRS",
  "RAILS", "RILES", "ARTEL", "STALE", "SLEET", "ELITE", "ARISE", "ASTIR", "SATIRE",
  
  // Set 2 (A, E, O, N, D, T, P)
  "PET", "TAP", "TOP", "POT", "DOT", "NOT", "NET", "TEN", "PEN", "END", 
  "PANT", "TAPE", "NEAT", "PANT", "PATE", "DATE", "POND", "TONE", "NOTE",
  "OPEN", "PEON", "DOPE", "OPED", "TEND", "DENT", "PEND", "OPTE", "POET",
  "PATE", "TAPE", "NOPE", "DOPE", "NOTED", "TONED", "DEPOT", "PANTO", "ATONE",
  "ADAPT", "ANTED", "PANED", "TAPED", "OPTED", "PATENT", "POTENT", "PEDANT",
  "ADENOPATHY", "PONENT", "DENOTATE", "ANTEDATED", "PATENTED", "ADAPTED",
  
  // Set 3 (E, I, O, M, C, H, S)
  "HIS", "SHE", "HIM", "HEM", "ICE", "SEE", "SOME", "HOME", "MICE", "CHEM",
  "EMIC", "ICES", "HOSE", "SHOE", "SEMI", "MESH", "SCHEME", "CHOOSE", "CHOSEN",
  "HECK", "MOCK", "SOCK", "MOSH", "ITCH", "MICH", "COME", "COMES", "COMIC", "MOSHE",
  "HOMES", "CHIME", "CHOSE", "CHEMS", "ECHES", "ECHOS", "MICHE", "MOCKS", "SOCKS",
  "MOSHES", "CHIMES", "SCHEME", "ESCHEW", "SMOOCH", "CHEMISE", "MOCHES", "CHEMOS",
  
  // Set 4 (A, I, U, B, F, K, R)
  "AIR", "FUR", "BAR", "FAR", "FIR", "IRK", "RIB", "FAKE", "FAIR", "BARF", "BARK",
  "BRIK", "BRIE", "FARK", "AIRBUS", "RABID", "AURIK", "FABRIC", "FAERIE", "FAKIR",
  "FERIA", "FRIAR", "KEFIR", "RABID", "RAFFIA", "REBUFF", "BRIEF", "BIKER", "BREAK",
  "BRAKE", "FREAK", "FEAR", "BEAR", "FIRE", "FAKE", "BIKE", "KITE", "KIRK", "RISK",
  "FISK", "BRISK", "AIRFARE", "BARBRI", "FAIRBAIRN", "BAKEFRUIT", "BARBERRIES",
  
  // Set 5 (E, O, U, G, L, W, Y)
  "WET", "LOW", "GEL", "LEG", "OWE", "WOE", "YOU", "GLOW", "GLUE", "UGLY", "WELT",
  "GULL", "WELL", "YULE", "YELL", "YOWL", "GLOW", "WELT", "GLUEY", "WOOLY", "GULLEY",
  "WOOLEY", "YOGULE", "GLOWWORM", "WOOLLY", "EULOGY", "YOUGLE", "YOWLER", "YELLOW",
  "OUTWELLY", "GULLWING", "ELEGWY", "GOW", "LOW", "YOW", "LUGE", "GLUE", "GREY", "GULL",
  "MULE", "LULL", "WULL", "GULL", "YULE", "OWLY", "WYLE", "WYLE", "LOWY", "GULE"
]);

// Colors for dark theme
const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#BB86FC',
  primaryVariant: '#3700B3',
  secondary: '#03DAC6',
  accent: '#CF6679',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#2C2C2C',
};

// Leaderboard entry type.
type LeaderboardEntry = {
  id: number;
  score: number;
  words: string[];
};

export default function App() {
  // Game states: "countdown", "playing", or "finished"
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState<number>(3);
  const [gameTime, setGameTime] = useState<number>(30);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentLetterSet, setCurrentLetterSet] = useState<string[]>(ALLOWED_LETTERS);
  
  // Timer for gameplay.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('finished');
            // Add current score to the leaderboard.
            const newEntry: LeaderboardEntry = {
              id: Date.now(),
              score,
              words: submittedWords,
            };
            setLeaderboard(prevLeaderboard => [...prevLeaderboard, newEntry]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, score, submittedWords]);
  
  // Countdown effect.
  useEffect(() => {
    if (gameState === 'countdown') {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);
  
  // Checks if a word is valid:
  // 1. It must have at least 2 letters.
  // 2. All its letters must come from currentLetterSet.
  // 3. The word is found in our dictionary.
  // 4. It has not already been submitted.
  const isValidWord = (word: string): boolean => {
    if (word.length < 2) return false;
    // All letters must be in currentLetterSet.
    for (let letter of word) {
      if (!currentLetterSet.includes(letter)) {
        return false;
      }
    }
    // Word must exist in our dictionary.
    if (!DICTIONARY.has(word)) {
      return false;
    }
    // Do not allow duplicate submissions.
    if (submittedWords.includes(word)) {
      return false;
    }
    return true;
  };
  
  // Handle when the player taps a letter button.
  const handleLetterPress = (letter: string) => {
    setCurrentWord(prev => prev + letter);
  };

  // Clear the current word.
  const handleClear = () => {
    setCurrentWord('');
  };

  // Submit the current word.
  const handleSubmitWord = () => {
    const word = currentWord.toUpperCase();
    if (!isValidWord(word)) {
      Alert.alert(
        "Invalid word", 
        "Either the word is too short, not in our dictionary, or has already been used.",
        [{ text: "OK", style: "cancel" }],
        { cancelable: true }
      );
      setCurrentWord('');
      return;
    }
    // Increase score by the length of the word.
    setScore(prev => prev + word.length);
    setSubmittedWords(prev => [...prev, word]);
    setCurrentWord('');
  };

  // Restart the game.
  const handleRestart = () => {
    // Pick a new random letter set for the next game
    setCurrentLetterSet(getRandomLetterSet());
    setGameState('countdown');
    setCountdown(3);
    setGameTime(30);
    setCurrentWord('');
    setSubmittedWords([]);
    setScore(0);
  };

  // Render the letter buttons.
  const renderLetters = () => {
    return (
      <View style={styles.lettersContainer}>
        {currentLetterSet.map(letter => (
          <TouchableOpacity
            key={letter}
            style={styles.letterButton}
            activeOpacity={0.7}
            onPress={() => handleLetterPress(letter)}
          >
            <Text style={styles.letterText}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render the list of submitted words.
  const renderSubmittedWords = () => {
    return (
      <ScrollView 
        style={styles.wordsList}
        contentContainerStyle={styles.wordsListContent}
      >
        {submittedWords.length === 0 ? (
          <Text style={styles.noWordsText}>No words submitted yet</Text>
        ) : (
          submittedWords.map((word, index) => (
            <View key={index} style={styles.wordContainer}>
              <Text style={styles.submittedWord}>
                {word} 
              </Text>
              <Text style={styles.wordPoints}>
                +{word.length}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  // Render the gameplay controls
  const renderControls = () => {
    return (
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={[styles.controlButton, styles.clearButton]} 
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.submitButton]} 
          onPress={handleSubmitWord}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render leaderboard (sorted by highest score).
  const renderLeaderboard = () => {
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
    return (
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        
        <ScrollView style={styles.leaderboardScroll}>
          {sortedLeaderboard.length === 0 ? (
            <Text style={styles.noEntriesText}>No games played yet</Text>
          ) : (
            sortedLeaderboard.map((entry, index) => (
              <View key={entry.id} style={styles.leaderboardRow}>
                <Text style={styles.leaderboardRank}>{index + 1}</Text>
                <Text style={styles.leaderboardScore}>{entry.score} pts</Text>
                <Text style={styles.leaderboardWords}>{entry.words.length} words</Text>
              </View>
            ))
          )}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.playAgainButton} 
          onPress={handleRestart}
          activeOpacity={0.7}
        >
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Main content rendering.
  const renderContent = () => {
    if (gameState === 'countdown') {
      return (
        <View style={styles.centered}>
          <Text style={styles.countdownText}>{countdown}</Text>
          <Text style={styles.countdownLabel}>Game starts in...</Text>
        </View>
      );
    } else if (gameState === 'playing') {
      return (
        <View style={styles.container}>
          <View style={styles.gameHeader}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Time Left</Text>
              <Text style={styles.timerText}>{gameTime}s</Text>
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          </View>
          
          <View style={styles.letterSetInfo}>
            <Text style={styles.letterSetLabel}>Current Letter Set:</Text>
            <Text style={styles.letterSetText}>{currentLetterSet.join(' ')}</Text>
          </View>
          
          <View style={styles.currentWordContainer}>
            <Text style={styles.currentWordText}>
              {currentWord || "Type a word..."}
            </Text>
          </View>
          
          {renderLetters()}
          {renderControls()}
          
          <View style={styles.wordsListSection}>
            <Text style={styles.wordsTitle}>Words Found</Text>
            {renderSubmittedWords()}
          </View>
        </View>
      );
    } else if (gameState === 'finished') {
      return (
        <View style={styles.centered}>
          <Text style={styles.finalScoreLabel}>Final Score</Text>
          <Text style={styles.finalScoreText}>{score}</Text>
          <Text style={styles.wordsFoundText}>
            Words found: {submittedWords.length}
          </Text>
          <View style={styles.letterSetSummary}>
            <Text style={styles.letterSetSummaryText}>
              Letter Set: {currentLetterSet.join(' ')}
            </Text>
          </View>
          {renderLeaderboard()}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  // Countdown styles
  countdownText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  countdownLabel: {
    fontSize: 22,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  // Game header styles
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginRight: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginLeft: 8,
  },
  letterSetInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  letterSetLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  letterSetText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Current word styles
  currentWordContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginVertical: 10,
    padding: 16,
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  currentWordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  // Letters styles
  lettersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    flexWrap: 'wrap',
  },
  letterButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    margin: 6,
    minWidth: 46,
    alignItems: 'center',
  },
  letterText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '700',
  },
  // Controls styles
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    marginLeft: 8,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  // Words list styles
  wordsListSection: {
    marginTop: 20,
    flex: 1,
  },
  wordsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  wordsList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: 10,
  },
  wordsListContent: {
    paddingVertical: 10,
  },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  submittedWord: {
    fontSize: 18,
    color: COLORS.text,
  },
  wordPoints: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  noWordsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  // Game finish styles
  finalScoreLabel: {
    fontSize: 22,
    color: COLORS.textSecondary,
  },
  finalScoreText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  wordsFoundText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 10,
  },
  letterSetSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 30,
  },
  letterSetSummaryText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  // Leaderboard styles
  leaderboardContainer: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    padding: 20,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  leaderboardScroll: {
    width: '100%',
    maxHeight: 200,
  },
  leaderboardRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leaderboardRank: {
    width: 40,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  leaderboardScore: {
    flex: 1,
    fontSize: 18,
    color: COLORS.text,
  },
  leaderboardWords: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  noEntriesText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginVertical: 20,
  },
  playAgainButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});