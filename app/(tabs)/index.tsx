
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Switch } from 'react-native';
import * as Speech from 'expo-speech';

const HOUSIE_MAX_NUMBER = 90;

const generateNumbers = (max) => {
  return Array.from({ length: max }, (_, i) => i + 1);
};

const NumberCell = ({ number, isCalled }) => (
  <View style={[styles.cell, isCalled ? styles.calledCell : {}]}>
    <Text style={styles.cellText}>{number}</Text>
  </View>
);

export default function HousieScreen() {
  const [numbers, setNumbers] = useState(generateNumbers(HOUSIE_MAX_NUMBER));
  const [calledNumbers, setCalledNumbers] = useState(new Set());
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);

  const speakNumber = (number) => {
    Speech.speak(number.toString());
  };

  const startGame = () => {
    setCalledNumbers(new Set());
    setCurrentNumber(null);
    setIsGameActive(true);
  };

  const callNextNumber = useCallback(() => {
    if (calledNumbers.size >= HOUSIE_MAX_NUMBER) {
      setIsGameActive(false);
      return;
    }

    let nextNumber;
    do {
      nextNumber = Math.floor(Math.random() * HOUSIE_MAX_NUMBER) + 1;
    } while (calledNumbers.has(nextNumber));

    const newCalledNumbers = new Set(calledNumbers);
    newCalledNumbers.add(nextNumber);

    setCalledNumbers(newCalledNumbers);
    setCurrentNumber(nextNumber);
    speakNumber(nextNumber);
  }, [calledNumbers]);

  const resetGame = () => {
    setCalledNumbers(new Set());
    setCurrentNumber(null);
    setIsGameActive(false);
    setIsAutoMode(false);
    Speech.stop();
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Housie Number Caller</Text>

      <View style={styles.controls}>
        <View style={styles.switchContainer}>
          <Text>Auto Mode</Text>
          <Switch
            value={isAutoMode}
            onValueChange={setIsAutoMode}
            disabled={!isGameActive}
          />
        </View>
        <Button title="Start Game" onPress={startGame} disabled={isGameActive} />
        <Button title="Next Number" onPress={callNextNumber} disabled={isAutoMode || !isGameActive} />
        <Button title="Reset" onPress={resetGame} />
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
          <NumberCell number={item} isCalled={calledNumbers.has(item)} />
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
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
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
