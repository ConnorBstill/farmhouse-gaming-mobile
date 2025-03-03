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
  { name: "Reaction Time", route: "/reaction-time", icon: "⚡" },
  { name: "Visual Game", route: "/visual-game", icon: "👁️" },
  { name: "Basket Catch", route: "/basket-catch", icon: "🧺" },
  { name: "Bomb Test", route: "/bomb-test", icon: "💣" },
  { name: "Button Mashing", route: "/button-mashing", icon: "👆" },
  { name: "Last Man Standing", route: "/last-man-standing", icon: "🏆" },
  { name: "Remembering Sequences", route: "/sequences", icon: "🔢" },
  { name: "Spelling Game", route: "/spelling-game", icon: "📝" },
  { name: "Wordle", route: "/wordle-game", icon: "🔤" },
  { name: "Colour Test", route: "/colour-test", icon: "🎨" },
  { name: "Stroop Test", route: "/stroop-test", icon: "🧠" },
  { name: "Aim Training", route: "/aim-training", icon: "🎯" },
  { name: "Typing Speed", route: "/typing-speed", icon: "⌨️" },
  { name: "Simple Math", route: "/math", icon: "🔢" },
  { name: "Word Unscramble", route: "/shuffle-word", icon: "🔄" },
  { name: "Word Game", route: "/word-game", icon: "📚" },
  { name: "Random Words", route: "/random-words", icon: "🎲" },
  { name: "Time Estimation", route: "/time-estimation", icon: "⏱️" },
  { name: "Rock Paper Scissors", route: "/rock-paper-scissors", icon: "✂️" },
  { name: "Eggplant Toss", route: "/eggplant-toss", icon: "🍆" },
  { name: "Rhythm Test", route: "/rhythm-test", icon: "🎵" },
  { name: "Simon", route: "/simon-game", icon: "🔍" },
  { name: "Snake", route: "/snake-game", icon: "🐍" },
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
              icon={item.icon}
              // style={styles.}
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
  gameListContainer: {
    width: "100%",
    flex: 1,
  },
  gameListContent: {
    alignItems: "center",
    paddingVertical: 10,
  },
  gameButton: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  gameIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  gameButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
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
