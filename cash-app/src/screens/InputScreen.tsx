import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { Button } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigators/AppNavigator";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const App: React.FC<Props> = ({ navigation }) => {
  const [inputValue, setInputValue] = useState("");

  // Function to handle input from keypad
  const handleInput = (value: string) => {
    setInputValue(inputValue + value);
  };

  // Function to handle backspace
  const handleBackspace = () => {
    setInputValue(inputValue.slice(0, -1));
  };

  type NumberButtonProps = {
    number: string;
  };

  // Create a single button for the keypad
  const NumberButton: React.FC<NumberButtonProps> = ({ number }) => (
    <TouchableOpacity style={styles.button} onPress={() => handleInput(number)}>
      <Text style={styles.buttonText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>${inputValue || "0"}</Text>
      </View>
      <View style={styles.keypad}>
        <View style={styles.row}>
          {[1, 2, 3].map((number) => (
            <NumberButton key={number} number={number.toString()} />
          ))}
        </View>
        <View style={styles.row}>
          {[4, 5, 6].map((number) => (
            <NumberButton key={number} number={number.toString()} />
          ))}
        </View>
        <View style={styles.row}>
          {[7, 8, 9].map((number) => (
            <NumberButton key={number} number={number.toString()} />
          ))}
        </View>
        <View style={styles.row}>
          <NumberButton number="." />
          <NumberButton number="0" />
          <TouchableOpacity style={styles.button} onPress={handleBackspace}>
            <Text style={styles.buttonText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          style={styles.sideButton}
          onPress={() => navigation.navigate("Receive", { inputValue })}
        >
          Request
        </Button>
        <Button
          mode="contained"
          style={styles.sideButton}
          onPress={() => navigation.navigate("Send", { inputValue })}
        >
          Pay
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  cameraContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 100,
    height: 100,
    overflow: "hidden",
    borderRadius: 50,
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  displayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 20,
    paddingLeft: 20,
  },
  displayText: {
    fontSize: 74,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  keypad: {
    paddingBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderRadius: 40,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  sideButton: {
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
  },
});

export default App;
