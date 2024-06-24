import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import { Button } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigators/AppNavigator";
import MaterialCommunityIcon from "@expo/vector-icons/MaterialCommunityIcons";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const App: React.FC<Props> = ({ navigation }) => {
  const [inputValue, setInputValue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

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

  const CurrencySelectorModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.bottomView}>
        <View style={styles.modalView}>
          <Text style={styles.buttonText}>Select Currency</Text>
          <View style={styles.centeredView}>
            <TouchableOpacity
              style={styles.fullWidthButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.currencyText}>
                {" "}
                <MaterialCommunityIcon
                  name="currency-usd"
                  size={30}
                  color="white"
                />
                US Dollars
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fullWidthButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.currencyText}>
                {" "}
                <MaterialCommunityIcon name="bitcoin" size={30} color="white" />
                Bitcoin
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ position: "absolute", bottom: 25 }}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.mediumButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <CurrencySelectorModal />
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>${inputValue || "0"}</Text>
        <TouchableOpacity
          style={{ position: "relative", marginTop: 15 }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.smallButtonText}>
            USD{" "}
            <MaterialCommunityIcon
              name="chevron-down"
              size={15}
              color="white"
            />
          </Text>
        </TouchableOpacity>
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
    backgroundColor: "#141414",
  },
  displayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 20,
    paddingLeft: 20,
  },
  displayText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#FFF",
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
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141414", // Darker button background
    borderRadius: 40,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF", // Light text color for buttons
  },
  currencyText: {
    fontSize: 18,
    color: "#FFF",
  },
  mediumButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF", // Light text color for buttons
  },
  smallButtonText: {
    fontSize: 15,
    color: "#FFF", // Light text color for buttons
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 5,
  },
  sideButton: {
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    backgroundColor: "#444",
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: "center",
    borderRadius: 50,
  },
  bottomView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  modalView: {
    backgroundColor: "#444",
    padding: 35,
    alignItems: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2, // Negative value to lift the shadow up
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    width: "100%", // Ensure the modal occupies full width
    height: "40%", // Only take up half the screen height
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
    padding: 10,
  },
  fullWidthButton: {
    backgroundColor: "transparent",
    alignSelf: "stretch",
    padding: 20,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },
});

export default App;
