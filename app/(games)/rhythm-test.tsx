import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Button, 
  ScrollView, 
  Alert 
} from 'react-native';

const BPM = 120; // beats per minute
const beatInterval = 60000 / BPM; // ms per beat (500ms at 120 BPM)

// Define game phases.
type GamePhase = 'countdown' | 'flashing' | 'free' | 'finished';

type LeaderboardEntry = {
  id: number;
  score: number;
};

export default function App() {
  // Phase state
  const [phase, setPhase] = useState<GamePhase>('countdown');
  // Countdown before game start.
  const [countdown, setCountdown] = useState<number>(3);
  
  // Flashing phase lasts 5 seconds, free phase lasts 10 seconds.
  const [freeDuration] = useState<number>(10000); // 10 sec free phase
  
  // Used for flashing the hourglass.
  const [flashOn, setFlashOn] = useState<boolean>(false);

  // Record timestamps (in ms) for drum taps.
  const [guidedTaps, setGuidedTaps] = useState<number[]>([]);
  const [freeTaps, setFreeTaps] = useState<number[]>([]);

  // Record start times for each phase.
  const [flashingStartTime, setFlashingStartTime] = useState<number>(0);
  const [freeStartTime, setFreeStartTime] = useState<number>(0);

  // Final score for this round.
  const [score, setScore] = useState<number>(0);
  // Leaderboard to keep previous scores.
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // ----- Countdown Phase -----
  useEffect(() => {
    if (phase === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Transition to flashing phase.
            setPhase('flashing');
            setFlashingStartTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // ----- Flashing Phase (5 seconds) -----
  useEffect(() => {
    if (phase === 'flashing') {
      // Instead of toggling the flash for the entire beat, we flash the hourglass only briefly.
      const flashInterval = setInterval(() => {
        setFlashOn(true);
        // Only highlight for 100ms.
        setTimeout(() => {
          setFlashOn(false);
        }, 100);
      }, beatInterval);
      // End flashing phase after 5 seconds.
      const timeout = setTimeout(() => {
        clearInterval(flashInterval);
        setFlashOn(false);
        // Transition to free phase and record its start time.
        setFreeStartTime(Date.now());
        setPhase('free');
      }, 5000);
      return () => {
        clearInterval(flashInterval);
        clearTimeout(timeout);
      };
    }
  }, [phase]);

  // ----- Free Phase (10 seconds) -----
  useEffect(() => {
    if (phase === 'free') {
      const freeTimer = setTimeout(() => {
        // After free phase, compute score.
        computeScore();
        setPhase('finished');
      }, freeDuration);
      return () => clearTimeout(freeTimer);
    }
  }, [phase]);

  // ----- Drum Tap Handler -----
  const handleDrumPress = () => {
    const now = Date.now();
    if (phase === 'flashing') {
      setGuidedTaps(prev => [...prev, now]);
    } else if (phase === 'free') {
      setFreeTaps(prev => [...prev, now]);
    }
  };

  // ----- Score Calculation -----
  const computeScore = () => {
    const numBeats = Math.floor(freeDuration / beatInterval);
    const expectedBeats: number[] = [];
    for (let i = 0; i < numBeats; i++) {
      expectedBeats.push(freeStartTime + i * beatInterval);
    }
    let totalError = 0;
    let count = 0;
    expectedBeats.forEach(expected => {
      let nearestError = beatInterval; // max error if no tap
      freeTaps.forEach(tap => {
        const diff = Math.abs(tap - expected);
        if (diff < nearestError) {
          nearestError = diff;
        }
      });
      totalError += nearestError;
      count++;
    });
    const avgError = count > 0 ? totalError / count : beatInterval;
    const computedScore = Math.max(0, Math.floor(1000 - avgError));
    setScore(computedScore);
    const newEntry: LeaderboardEntry = { id: Date.now(), score: computedScore };
    setLeaderboard(prev => [...prev, newEntry]);
  };

  // ----- Restart Handler -----
  const handleRestart = () => {
    setPhase('countdown');
    setCountdown(3);
    setFlashOn(false);
    setGuidedTaps([]);
    setFreeTaps([]);
    setScore(0);
    setFlashingStartTime(0);
    setFreeStartTime(0);
  };

  // ----- Rendering -----
  const renderCountdown = () => (
    <View style={styles.centered}>
      <Text style={styles.countdownText}>{countdown}</Text>
    </View>
  );

  const renderFlashing = () => (
    <View style={styles.centered}>
      <Text style={[styles.hourglass, flashOn ? styles.flashOn : styles.flashOff]}>
        ⏳
      </Text>
      <TouchableOpacity style={styles.drumButton} onPress={handleDrumPress}>
        <Text style={styles.drumEmoji}>🥁</Text>
      </TouchableOpacity>
      <Text style={styles.pressText}>PRESS</Text>
      <Text style={styles.phaseLabel}>Follow the rhythm!</Text>
      <Text style={styles.timerLabel}>5 seconds</Text>
    </View>
  );

  const renderFreePhase = () => (
    <View style={styles.centered}>
      <Text style={styles.hourglassStatic}>⏳</Text>
      <TouchableOpacity style={styles.drumButton} onPress={handleDrumPress}>
        <Text style={styles.drumEmoji}>🥁</Text>
      </TouchableOpacity>
      <Text style={styles.pressText}>PRESS</Text>
      <Text style={styles.phaseLabel}>Continue the rhythm!</Text>
      <Text style={styles.timerLabel}>10 seconds</Text>
    </View>
  );

  const renderFinished = () => (
    <ScrollView contentContainerStyle={styles.centered}>
      <Text style={styles.finalTitle}>Time's Up!</Text>
      <Text style={styles.finalTitle}>Score: {score}</Text>
      <Text style={styles.leaderboardTitle}>Leaderboard</Text>
      {leaderboard
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => (
          <Text key={entry.id} style={styles.leaderboardEntry}>
            {index + 1}. {entry.score} pts
          </Text>
        ))}
      <Button title="Play Again" onPress={handleRestart} />
    </ScrollView>
  );

  const renderContent = () => {
    switch (phase) {
      case 'countdown':
        return renderCountdown();
      case 'flashing':
        return renderFlashing();
      case 'free':
        return renderFreePhase();
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
    backgroundColor: '#fff',
    paddingTop: 40,
    alignItems: 'center',
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
  hourglass: {
    fontSize: 100,
    marginBottom: 20,
  },
  flashOn: {
    opacity: 1,
  },
  flashOff: {
    opacity: 0.2,
  },
  hourglassStatic: {
    fontSize: 100,
    marginBottom: 20,
    opacity: 1,
  },
  drumButton: {
    backgroundColor: '#4a90e2',
    padding: 20,
    borderRadius: 50,
    marginBottom: 10,
  },
  drumEmoji: {
    fontSize: 50,
  },
  pressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 10,
  },
  phaseLabel: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  timerLabel: {
    fontSize: 20,
    color: '#333',
  },
  finalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  leaderboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  leaderboardEntry: {
    fontSize: 22,
    marginVertical: 4,
  },
});

