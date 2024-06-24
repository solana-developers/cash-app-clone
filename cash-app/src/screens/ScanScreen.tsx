import { Button, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useAuthorization } from "../utils/useAuthorization";
import { Section } from "../Section";
import { SignInFeature } from "../components/sign-in/sign-in-feature";
import { SolanaPayButton } from "../components/solana-pay/solana-pay-ui";
export function ScanScreen() {
  const { selectedAccount } = useAuthorization();

  return (
    <View style={styles.container}>
      {selectedAccount ? (
        <View style={styles.container}>
          <SolanaPayButton address={selectedAccount.publicKey} />
        </View>
      ) : (
        <>
          <Text style={styles.headerTextLarge}>Solana Cash App</Text>
          <Section description="Sign in with Solana (SIWS) to link your wallet." />
          <SignInFeature />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: "column",
    paddingVertical: 4,
  },
  text: {
    marginBottom: 1,
    textAlign: "center",
    fontSize: 25,
    color: "white",
  },
  headerTextLarge: {
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 12,
    textAlign: "center",
    fontSize: 30,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#141414",
  },
  container2: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#444",
  },
});
