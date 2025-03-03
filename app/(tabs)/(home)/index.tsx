import React, { useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  FlatList,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { GameListItem } from "@/components/GameListItem";
import { Game } from "../../../lib/types";

const gameList: Game[] = [
  { name: "Reaction Time", route: "/reaction-time" },
  { name: "Visual Game", route: "/visual-game" },
  { name: "Basket Catch", route: "/basket-catch" },
  { name: "Bomb Test", route: "/bomb-test" },
  { name: "Button mashing", route: "/button-mashing" },
  { name: "Last Man Standing", route: "/last-man-standing" },
  { name: "Remembering sequences", route: "/sequences" },
  { name: "Face Finder", route: "/face-finder" },
  { name: "Spelling Game", route: "/spelling-game" },
  { name: "Wordle", route: "/wordle-game" },
  { name: "Colour Test", route: "/colour-test" },
  { name: "Stroop Test", route: "/stroop-test" },
  { name: "Aim Training", route: "/aim-training" },
  { name: "Typing speed", route: "/typing-speed" },
  { name: "Simple math", route: "/math" },
  { name: "Word Unscramble", route: "/shuffle-word" },
  { name: "Word Game", route: "/word-game" },
  { name: "Random Words", route: "/random-words" },
  { name: "Time Estimation", route: "/time-estimation" },
  { name: "Rock Paper Scissors", route: "/rock-paper-scissors" },
  { name: "Eggplant Toss", route: "/eggplant-toss" },
  { name: "Rhythm Test", route: "/rhythm-test" },
  { name: "Simon", route: "/simon-game" },
  { name: "Snake", route: "/snake-game" },
];

export default function HomeScreen(): JSX.Element {
  // Create an animated value for the background.
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loop an animation that goes from 0 to 1 over 10 seconds.
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [animatedValue]);

  // Interpolate the animated value to create a dynamic background colour.
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#121212', '#2c3e50', '#121212'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <SafeAreaView style={styles.safeArea}>
        <ThemedText style={styles.header}>Game App</ThemedText>
        <FlatList
          data={gameList}
          renderItem={({ item }) => (
            <GameListItem
              name={item.name}
              route={item.route}
              style={styles.listItem}
            />
          )}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
          style={styles.flatList}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  flatList: {
    flex: 1,
    width: "100%",
  },
  listContent: {
    paddingBottom: 30,
  },
  listItem: {
    marginVertical: 8,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 40,
    borderRadius: 4,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
  },
});
