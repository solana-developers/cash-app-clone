import {
  Button,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useAuthorization } from "../../utils/useAuthorization";
import {
  AccountBalance,
  AccountButtonGroup,
  PendingPayments,
  PendingRequest,
} from "./account-ui";
import { useState } from "react";
import { AddFriend } from "./add-friend-ui";

export function ActivityFeature() {
  const { selectedAccount } = useAuthorization();
  const [modalVisible, setModalVisible] = useState(false);

  if (!selectedAccount) {
    return null;
  }
  const theme = useTheme();

  return (
    <>
      <View style={styles.cardContainer}>
        <AddFriend address={selectedAccount.publicKey} />
      </View>
      {/* <View style={styles.cardContainer}>
        <PendingPayments address={selectedAccount.publicKey} />
      </View> */}
      <View style={styles.cardContainer}>
        <PendingRequest address={selectedAccount.publicKey} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    padding: 16,
    flex: 1,
  },
  cardContainer: {
    backgroundColor: "#222",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginVertical: 10,
  },
  buttonGroup: {
    flexDirection: "column",
    paddingVertical: 4,
  },
  headerText: {
    marginBottom: 1,
    textAlign: "left",
    fontSize: 20,
    color: "white",
  },
  headerTextLarge: {
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 12,
    textAlign: "center",
    color: "white",
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
  bottomView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF", // Light text color for buttons
  },
});
