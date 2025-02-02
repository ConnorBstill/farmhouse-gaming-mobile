import { Image, StyleSheet, Platform, Pressable } from "react-native";
import { Link } from "expo-router";
import { RelativePathString } from "expo-router";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { Game } from "../lib/types";

const GameListItem = ({ route, name }: Game) => {
  return (
    <Link href={route} asChild style={styles.container}>
      <Pressable style={styles.pressable}>
        <ThemedText style={styles.text}>{name}</ThemedText>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    // borderColor: 'black',
    // borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
    height: 150,
    width: 150,
  },
  pressable: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  text: {
    textAlign: "center",
  },
});

export { GameListItem };
