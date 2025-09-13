
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

const HOUSIE_MAX_NUMBER = 90;
const SECRET_KEY = 55;

const generateNumbers = (max) => {
  return Array.from({ length: max }, (_, i) => i + 1);
};

const NumberCell = ({ number, isCalled, onPress }) => (
  <Pressable onPress={onPress}>
    <View style={[styles.cell, isCalled ? styles.calledCell : {}]}>
      <Text style={styles.cellText}>{number}</Text>
    </View>
  </Pressable>
);

export default function HousieScreen() {
  const [numbers, setNumbers] = useState(generateNumbers(HOUSIE_MAX_NUMBER));
  const [calledNumbers, setCalledNumbers] = useState(new Set());
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isSecretMode, setIsSecretMode] = useState(false);
  const [secretNumbers, setSecretNumbers] = useState([]);
  const [nextSecretNumberIndex, setNextSecretNumberIndex] = useState(0);
  const [titlePressCount, setTitlePressCount] = useState(0);
  const [awaitingSecretKey, setAwaitingSecretKey] = useState(false);

  const speakNumber = (number) => {
    Speech.speak(number.toString());
  };

  const startGame = () => {
    setCalledNumbers(new Set());
    setCurrentNumber(null);
    setIsGameActive(true);
    setNextSecretNumberIndex(0);
  };

  const callNextNumber = useCallback(() => {
    if (calledNumbers.size >= HOUSIE_MAX_NUMBER) {
      setIsGameActive(false);
      return;
    }

    let nextNumber;
    if (isSecretMode && nextSecretNumberIndex < secretNumbers.length) {
      nextNumber = secretNumbers[nextSecretNumberIndex];
      setNextSecretNumberIndex(nextSecretNumberIndex + 1);
    } else {
      do {
        nextNumber = Math.floor(Math.random() * HOUSIE_MAX_NUMBER) + 1;
      } while (calledNumbers.has(nextNumber));
    }

    const newCalledNumbers = new Set(calledNumbers);
    newCalledNumbers.add(nextNumber);

    setCalledNumbers(newCalledNumbers);
    setCurrentNumber(nextNumber);
    speakNumber(nextNumber);
  }, [calledNumbers, isSecretMode, secretNumbers, nextSecretNumberIndex]);

  const resetGame = () => {
    setCalledNumbers(new Set());
    setCurrentNumber(null);
    setIsGameActive(false);
    setIsAutoMode(false);
    Speech.stop();
    setIsSecretMode(false);
    setSecretNumbers([]);
    setNextSecretNumberIndex(0);
    setTitlePressCount(0);
    setAwaitingSecretKey(false);
  };

  const toggleSecretNumber = (number) => {
    if (awaitingSecretKey) {
      if (number === SECRET_KEY) {
        setIsSecretMode(true);
      }
      setAwaitingSecretKey(false);
      return;
    }

    if (isSecretMode && !isGameActive) {
      const newSecretNumbers = [...secretNumbers];
      const index = newSecretNumbers.indexOf(number);
      if (index > -1) {
        newSecretNumbers.splice(index, 1);
      } else {
        newSecretNumbers.push(number);
      }
      setSecretNumbers(newSecretNumbers);
    }
  };

  const handleTitlePress = () => {
    const newPressCount = titlePressCount + 1;
    setTitlePressCount(newPressCount);
    if (newPressCount === 3) {
      if (isSecretMode) {
        setIsSecretMode(false);
        setSecretNumbers([]);
        setAwaitingSecretKey(false);
      } else {
        setAwaitingSecretKey(true);
      }
      setTitlePressCount(0);
    }
  };

  useEffect(() => {
    let interval;
    if (isAutoMode && isGameActive) {
      interval = setInterval(() => {
        callNextNumber();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoMode, isGameActive, callNextNumber]);

  const getTitleStyle = () => {
    if (isSecretMode) {
      return styles.secretTitle;
    }
    if (awaitingSecretKey) {
      //return styles.armedTitle;
      return styles.secretTitle;
    }
    return styles.title;
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleTitlePress}>
        <Text style={getTitleStyle()}>Housie Number Caller</Text>
      </Pressable>

      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          <Button title="Start Game" onPress={startGame} disabled={isGameActive} />
          <Button title="Reset" onPress={resetGame} />
        </View>
        <View style={styles.controlRow}>
          <View style={styles.switchContainer}>
            <Text>Auto Mode</Text>
            <Switch
              value={isAutoMode}
              onValueChange={setIsAutoMode}
              disabled={!isGameActive}
            />
          </View>
          <Button title="Next Number" onPress={callNextNumber} disabled={isAutoMode || !isGameActive} />
        </View>
      </View>

      {currentNumber && (
        <View style={styles.currentNumberContainer}>
          <Text style={styles.currentNumberText}>Last Called:</Text>
          <Text style={styles.currentNumber}>{currentNumber}</Text>
        </View>
      )}

      <FlatList
        data={numbers}
        renderItem={({ item }) => (
          <NumberCell
            number={item}
            isCalled={calledNumbers.has(item)}
            onPress={() => toggleSecretNumber(item)}
          />
        )}
        keyExtractor={(item) => item.toString()}
        numColumns={10}
        contentContainerStyle={styles.board}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  secretTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#e6e6e6',
  },
  armedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: 'lightyellow',
  },
  controlsContainer: {
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentNumberContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentNumberText: {
    fontSize: 18,
  },
  currentNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  board: {
    alignItems: 'center',
  },
  cell: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 2,
  },
  calledCell: {
    backgroundColor: 'lightblue',
  },
  cellText: {
    fontSize: 16,
  },
});
