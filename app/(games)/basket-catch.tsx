import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const basketSize = 60;
const objectSize = 40;
const gameDuration = 25000; // 25 seconds
const appleEmoji = '🍏';
const beeEmoji = '🐝';
const bananaEmoji = '🍌';

interface FallingObject {
    x: number;
    y: number;
    emoji: string;
    points: number;
}

const BasketCatchGame = () => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(3);
    const [gameRunning, setGameRunning] = useState(false);
    const [objects, setObjects] = useState<FallingObject[]>([]);
    const basketX = useSharedValue(width / 2 - basketSize / 2);
    const speed = useSharedValue(2);

    useEffect(() => {
        let countdown: string | number | NodeJS.Timeout | undefined;
        if (timeLeft > 0) {
            countdown = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else {
            setGameRunning(true);
            startGame();
        }
        return () => clearTimeout(countdown);
    }, [timeLeft]);

    useEffect(() => {
        if (gameRunning) {
            const interval = setInterval(() => {
                spawnObject();
                speed.value += 0.1;
            }, 1000);
            setTimeout(() => setGameRunning(false), gameDuration);
            return () => clearInterval(interval);
        }
    }, [gameRunning]);

    const spawnObject = () => {
        const randomX = Math.random() * (width - objectSize);
        const randomType = Math.random();
        let emoji = appleEmoji;
        let points = 1;
        if (randomType < 0.1) {
            emoji = bananaEmoji;
            points = 2;
        } else if (randomType < 0.3) {
            emoji = beeEmoji;
            points = -1;
        }
        setObjects((prev) => [...prev, { x: randomX, y: 0, emoji, points }]);
    };

    const moveBasket = (direction: number) => {
        basketX.value = withTiming(
            Math.min(Math.max(basketX.value + direction * 50, 0), width - basketSize),
            { duration: 100 }
        );
    };

    const basketStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: basketX.value }]
    }));

    return (
        <GestureHandlerRootView style={styles.container}>
            {timeLeft > 0 ? (
                <Text style={styles.countdown}>{timeLeft}</Text>
            ) : gameRunning ? (
                <>
                    <Text style={styles.score}>Score: {score}</Text>
                    <View style={styles.fallingObjectsContainer}>
                        {objects.map((obj, index) => (
                            <Animated.Text key={index} style={[styles.fallingObject, { left: obj.x, top: obj.y }]}>
                                {obj.emoji}
                            </Animated.Text>
                        ))}
                    </View>
                    <Animated.View style={[styles.basket, basketStyle]}>
                        <Text style={styles.emoji}>🧺</Text>
                    </Animated.View>
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={() => moveBasket(-1)} style={styles.button}><Text style={styles.buttonText}>⬅️</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => moveBasket(1)} style={styles.button}><Text style={styles.buttonText}>➡️</Text></TouchableOpacity>
                    </View>
                </>
            ) : (
                <Text style={styles.gameOver}>Game Over! Final Score: {score}</Text>
            )}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'center'
    },
    countdown: {
        fontSize: 50,
        color: '#FFF'
    },
    score: {
        position: 'absolute',
        top: 50,
        color: '#FFF',
        fontSize: 24
    },
    fallingObjectsContainer: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '80%',
    },
    fallingObject: {
        position: 'absolute',
        fontSize: 30,
    },
    basket: {
        position: 'absolute',
        bottom: 50,
        width: basketSize,
        height: basketSize,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emoji: {
        fontSize: 40
    },
    controls: {
        position: 'absolute',
        bottom: 10,
        flexDirection: 'row'
    },
    button: {
        margin: 10,
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 10
    },
    buttonText: {
        fontSize: 30,
        color: '#FFF'
    },
    gameOver: {
        fontSize: 30,
        color: '#FFF'
    }
});

function startGame(...args: []) {
  throw new Error('Function not implemented.');
}

