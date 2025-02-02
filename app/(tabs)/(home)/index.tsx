import {
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  FlatList,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GameListItem } from "@/components/GameListItem";

import { Game } from "../../../lib/types";

const gameList: Game[] = [
  {
    name: "Reaction Time",
    route: "/reaction-time",
  },
  {
    name: "Button mashing",
    route: "/reaction-time",
  },
  {
    name: "Remembering sequences",
    route: "/reaction-time",
  },
  {
    name: "Typing speed",
    route: "/reaction-time",
  },
  {
    name: "Simple math",
    route: "/reaction-time",
  },
  {
    name: "Simple math",
    route: "/reaction-time",
  },
];

export default function HomeScreen() {
  return (
    <ThemedView style={styles.scrollView}>
      <SafeAreaView>
        <FlatList
          data={gameList}
          renderItem={({ item }) => (
            <GameListItem name={item.name} route={item.route} />
          )}
          keyExtractor={(item) => item.name}
          numColumns={2}
          contentContainerStyle={{ alignItems: "center" }}
          style={{
            height: "100%",
            width: "100%",
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    height: "100%",
  },
  container: {
    height: "100%",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gameListContainer: {},
});
