import React, { useState, useEffect } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
  Dimensions,
  Platform,
} from "react-native";

// ----- Types and Data -----
type Game = {
  name: string;
  route: string;
  icon: string; // Emoji icon for the game
};

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

// Extend our screen types to include our game screens
type Screen =
  | "Home"
  | "Login"
  | "NameAndIcon"
  | "MainMenu"
  | "Host"
  | "Join"
  | "SoloPlay"
  | "Settings"
  | string; // Allow any string for game routes

export default function App() {
  // Global navigation state
  const [currentScreen, setCurrentScreen] = useState<Screen>("Home");
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  // For passing the chosen game
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  // Shared state for Login, Name & Icon
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [emojiIndex, setEmojiIndex] = useState<number>(0);
  const animalEmojis = [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
    "🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆"
  ];

  // Screen transition effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    };
  }, [currentScreen]);

  // Custom Button Component
  const CustomButton = ({ title, onPress, color = "#4361EE", style = {} }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  // Custom Input Component
  const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry = false }) => (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );

  // Screen wrapper with animations
  const ScreenWrapper = ({ children }) => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#030617" />
      <View style={styles.backgroundGradient}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </SafeAreaView>
  );

  // ------------- Home Screen -------------
  const HomeScreen = () => (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎮</Text>
          <Text style={styles.title}>Game Hub</Text>
          <Text style={styles.subtitle}>Play, Compete, Connect</Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Log In"
            onPress={() => setCurrentScreen("Login")}
            style={styles.mainButton}
          />
          <CustomButton
            title="Guest Play"
            onPress={() => setCurrentScreen("NameAndIcon")}
            color="#3F72AF"
            style={styles.mainButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );

  // ------------- Login Screen -------------
  const LoginScreen = () => (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Log In</Text>
        <View style={styles.formContainer}>
          <CustomInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <CustomButton
            title="Sign In"
            onPress={() => setCurrentScreen("NameAndIcon")}
            style={styles.formButton}
          />
          <CustomButton
            title="Create Account"
            onPress={() => setCurrentScreen("NameAndIcon")}
            color="#3F72AF"
            style={styles.formButton}
          />
        </View>
        <View style={styles.footer}>
          <CustomButton
            title="Back"
            onPress={() => setCurrentScreen("Home")}
            color="#6C757D"
            style={styles.backButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );

  // ------------- Name & Icon Selection Screen -------------
  const NameAndIconScreen = () => (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Your Profile</Text>
        <View style={styles.formContainer}>
          <CustomInput
            placeholder="Enter your name"
            value={playerName}
            onChangeText={setPlayerName}
          />
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={() =>
                setEmojiIndex((emojiIndex - 1 + animalEmojis.length) % animalEmojis.length)
              }
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.icon}>{animalEmojis[emojiIndex]}</Text>
            <TouchableOpacity
              onPress={() => setEmojiIndex((emojiIndex + 1) % animalEmojis.length)}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>▶</Text>
            </TouchableOpacity>
          </View>
          <CustomButton
            title="Continue"
            onPress={() => setCurrentScreen("MainMenu")}
            style={styles.formButton}
          />
        </View>
        <View style={styles.footer}>
          <CustomButton
            title="Back"
            onPress={() => setCurrentScreen("Home")}
            color="#6C757D"
            style={styles.backButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );

  // ------------- Main Menu Screen -------------
  const MainMenuScreen = () => (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.welcomeText}>
            Welcome, {playerName || "Player"} {animalEmojis[emojiIndex]}
          </Text>
        </View>
        <View style={styles.menuContainer}>
          <CustomButton
            title="🏠 Host Game"
            onPress={() => setCurrentScreen("Host")}
            style={styles.menuButton}
          />
          <CustomButton
            title="🔍 Join Game"
            onPress={() => setCurrentScreen("Join")}
            style={styles.menuButton}
          />
          <CustomButton
            title="🎲 Solo Play"
            onPress={() => setCurrentScreen("SoloPlay")}
            style={styles.menuButton}
          />
          <CustomButton
            title="⚙️ Settings"
            onPress={() => setCurrentScreen("Settings")}
            style={styles.menuButton}
          />
        </View>
        <View style={styles.footer}>
          <CustomButton
            title="Sign Out"
            onPress={() => setCurrentScreen("Home")}
            color="#6C757D"
            style={styles.backButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );

  // ------------- Host Screen -------------
  const HostScreen = () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>Host Lobby</Text>
          <View style={styles.roomCodeContainer}>
            <Text style={styles.roomCodeLabel}>Room Code</Text>
            <Text style={styles.roomCode}>{roomCode}</Text>
            <Text style={styles.roomCodeHint}>Share this code with your friends</Text>
          </View>
          <View style={styles.lobbyControls}>
            <CustomButton
              title="Game Settings"
              onPress={() => alert("Game settings not implemented.")}
              style={styles.lobbyButton}
            />
            <CustomButton
              title="Select Game"
              onPress={() => setCurrentScreen("SoloPlay")}
              style={styles.lobbyButton}
            />
            <CustomButton
              title="Start Game"
              onPress={() => alert("Starting game...")}
              color="#4CAF50"
              style={styles.lobbyButton}
            />
          </View>
          <View style={styles.footer}>
            <CustomButton
              title="Back"
              onPress={() => setCurrentScreen("MainMenu")}
              color="#6C757D"
              style={styles.backButton}
            />
          </View>
        </View>
      </ScreenWrapper>
    );
  };

  // ------------- Join Screen -------------
  const JoinScreen = () => {
    const [roomCode, setRoomCode] = useState<string>("");
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>Join Lobby</Text>
          <View style={styles.formContainer}>
            <Text style={styles.instructions}>Enter the room code shared with you</Text>
            <CustomInput
              placeholder="Room Code"
              value={roomCode}
              onChangeText={setRoomCode}
            />
            <CustomButton
              title="Join Game"
              onPress={() => alert(`Joining room ${roomCode}`)}
              style={styles.formButton}
            />
          </View>
          <View style={styles.footer}>
            <CustomButton
              title="Back"
              onPress={() => setCurrentScreen("MainMenu")}
              color="#6C757D"
              style={styles.backButton}
            />
          </View>
        </View>
      </ScreenWrapper>
    );
  };

  // ------------- Solo Play Screen -------------
  const SoloPlayScreen = () => (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Game Library</Text>
        <ScrollView 
          style={styles.gameListContainer}
          contentContainerStyle={styles.gameListContent}
          showsVerticalScrollIndicator={false}
        >
          {gameList.map((game) => (
            <TouchableOpacity
              key={game.name}
              style={styles.gameButton}
              onPress={() => {
                setCurrentGame(game);
                setCurrentScreen(game.route);
              }}
            >
              <Text style={styles.gameIcon}>{game.icon}</Text>
              <Text style={styles.gameButtonText}>{game.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <CustomButton
            title="Back"
            onPress={() => setCurrentScreen("MainMenu")}
            color="#6C757D"
            style={styles.backButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );

  // ------------- Settings Screen -------------
  const SettingsScreen = () => (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔊</Text>
            <Text style={styles.settingText}>Sound Effects</Text>
            <View style={styles.settingToggle}>
              <View style={styles.toggleActive} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🎵</Text>
            <Text style={styles.settingText}>Background Music</Text>
            <View style={styles.settingToggle}>
              <View style={styles.toggleActive} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🌙</Text>
            <Text style={styles.settingText}>Dark Mode</Text>
            <View style={[styles.settingToggle, styles.toggleOn]}>
              <View style={styles.toggleActiveRight} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>💧</Text>
            <Text style={styles.settingText}>Hydration Mode</Text>
            <View style={styles.settingToggle}>
              <View style={styles.toggleActive} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingText}>Notifications</Text>
            <View style={[styles.settingToggle, styles.toggleOn]}>
              <View style={styles.toggleActiveRight} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <CustomButton
            title="Back"
            onPress={() => setCurrentScreen("MainMenu")}
            color="#6C757D"
            style={styles.backButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );

  // ------------- Game Screen -------------
  const GameScreen = () => {
    // Get the current game from the route
    const gameRoute = currentScreen;
    const game = currentGame || gameList.find(g => g.route === gameRoute) || { name: "Game", icon: "🎮" };
    
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <View style={styles.gameHeader}>
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <Text style={styles.gameTitle}>{game.name}</Text>
          </View>
          <View style={styles.gameContainer}>
            <Text style={styles.gameInstructions}>Game content will appear here</Text>
          </View>
          <View style={styles.gameControls}>
            <CustomButton
              title="Start"
              onPress={() => alert(`Starting ${game.name}...`)}
              color="#4CAF50"
              style={styles.gameControlButton}
            />
            <CustomButton
              title="Instructions"
              onPress={() => alert(`Instructions for ${game.name}`)}
              color="#3F72AF"
              style={styles.gameControlButton}
            />
          </View>
          <View style={styles.footer}>
            <CustomButton
              title="Back to Menu"
              onPress={() => setCurrentScreen("SoloPlay")}
              color="#6C757D"
              style={styles.backButton}
            />
          </View>
        </View>
      </ScreenWrapper>
    );
  };

  // ------------- Main Render Logic -------------
  // If currentScreen starts with "/", it's a game route
  if (currentScreen.startsWith("/")) {
    return <GameScreen />;
  }

  // Otherwise, use our screen switch
  switch (currentScreen) {
    case "Home":
      return <HomeScreen />;
    case "Login":
      return <LoginScreen />;
    case "NameAndIcon":
      return <NameAndIconScreen />;
    case "MainMenu":
      return <MainMenuScreen />;
    case "Host":
      return <HostScreen />;
    case "Join":
      return <JoinScreen />;
    case "SoloPlay":
      return <SoloPlayScreen />;
    case "Settings":
      return <SettingsScreen />;
    default:
      return <HomeScreen />;
  }
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030617",
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: "#030617",
    width: "100%",
    height: "100%",
  },
  animatedContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#CBD5E1",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 50,
  },
  mainButton: {
    marginVertical: 10,
    width: "80%",
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  formContainer: {
    width: "90%",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    color: "#fff",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.5)",
  },
  formButton: {
    width: "100%",
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 25,
  },
  icon: {
    fontSize: 70,
    marginHorizontal: 25,
  },
  iconButton: {
    backgroundColor: "#3F72AF",
    padding: 12,
    borderRadius: 10,
  },
  iconButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    minWidth: 150,
  },
  menuContainer: {
    width: "90%",
    alignItems: "center",
  },
  menuButton: {
    width: "90%",
    marginVertical: 10,
  },
  roomCodeContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "90%",
    marginVertical: 20,
  },
  roomCodeLabel: {
    color: "#CBD5E1",
    fontSize: 16,
    marginBottom: 5,
  },
  roomCode: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4361EE",
    letterSpacing: 8,
    marginVertical: 15,
  },
  roomCodeHint: {
    color: "#CBD5E1",
    fontSize: 14,
  },
  lobbyControls: {
    width: "90%",
    marginVertical: 20,
  },
  lobbyButton: {
    width: "100%",
    marginVertical: 8,
  },
  instructions: {
    fontSize: 16,
    color: "#CBD5E1",
    marginBottom: 20,
    textAlign: "center",
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
  settingsContainer: {
    width: "90%",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    padding: 15,
    marginVertical: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(71, 85, 105, 0.3)",
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
    textAlign: "center",
  },
  settingText: {
    color: "#fff",
    fontSize: 18,
    flex: 1,
  },
  settingToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#475569",
    padding: 2,
  },
  toggleOn: {
    backgroundColor: "#4361EE",
  },
  toggleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  toggleActiveRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginLeft: "auto",
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  gameContainer: {
    flex: 1,
    width: "90%",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  gameInstructions: {
    color: "#CBD5E1",
    fontSize: 18,
    textAlign: "center",
  },
  gameControls: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  gameControlButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});