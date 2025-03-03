import { Image, StyleSheet, Platform, Pressable, Text } from "react-native";
import { Link } from "expo-router";
import { RelativePathString } from "expo-router";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { Game } from "../lib/types";

const GameListItem = ({ route, name, icon }: Game) => {
  return (
    <Link href={route} asChild>
      <Pressable style={styles.container}>
        <Text style={styles.icon}>{icon}</Text><ThemedText style={styles.text}>{name}</ThemedText>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
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
  pressable: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  text: {
    textAlign: "center",
    color: '#fff'
  },
  icon: {
    marginRight: 5
  }
});

export { GameListItem };
