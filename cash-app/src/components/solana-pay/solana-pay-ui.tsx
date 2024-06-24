import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { View, StyleSheet, Modal, Text } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { AppModal } from "../ui/app-modal";
import BigNumber from "bignumber.js";
import { encodeURL } from "@solana/pay";
import QRCode from "react-native-qrcode-svg";

export function SolanaPayButton({ address }: { address: PublicKey }) {
  const [showPayModal, setShowPayModal] = useState(false);

  const [url, setUrl] = useState("");

  return (
    <>
      <View>
        <View
          style={{
            height: 200,
            width: 200,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            marginBottom: 200,
            marginTop: 200,
          }}
        >
          {url ? (
            <>
              <View
                style={{
                  height: 350,
                  width: 350,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                  backgroundColor: "#333",
                  borderRadius: 25,
                }}
              >
                <QRCode
                  value={url}
                  size={300}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            </>
          ) : (
            <View
              style={{
                height: 350,
                width: 350,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ccc",
                backgroundColor: "#333",
                borderRadius: 25,
              }}
            >
              <Text style={styles.text2}> Generate a QR Code to display. </Text>
            </View>
          )}
          <Text style={styles.text}> Scan to Pay </Text>
          <Text style={styles.text3}> $BRIMIGS </Text>
        </View>
        <SolPayModal
          hide={() => setShowPayModal(false)}
          show={showPayModal}
          address={address}
          setParentUrl={setUrl}
        />
        <Button
          mode="contained"
          onPress={() => setShowPayModal(true)}
          style={styles.button}
        >
          Create New QR Code
        </Button>
      </View>
    </>
  );
}

export function SolPayModal({
  hide,
  show,
  address,
  setParentUrl,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
  setParentUrl: (url: string) => void;
}) {
  const [memo, setMemo] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    const number = BigNumber(amount);
    const newUrl = encodeURL({
      recipient: address,
      amount: number,
      memo,
    }).toString();
    setParentUrl(newUrl);
    hide();
  };

  return (
    <AppModal
      title="Pay"
      hide={hide}
      show={show}
      submit={handleSubmit}
      submitLabel="Create QR"
      submitDisabled={!memo || !amount}
    >
      <View style={{ padding: 20 }}>
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={{ marginBottom: 20, backgroundColor: "#f0f0f0" }}
        />
        <TextInput
          label="Memo"
          value={memo}
          onChangeText={setMemo}
          mode="outlined"
          style={{ marginBottom: 5, backgroundColor: "#f0f0f0" }}
        />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  text: {
    marginBottom: 1,
    textAlign: "center",
    fontSize: 25,
    color: "white",
    marginTop: 30,
  },
  button: {
    backgroundColor: "#444",
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: "center",
    borderRadius: 50,
  },
  text2: {
    marginBottom: 1,
    textAlign: "center",
    fontSize: 15,
    color: "black",
  },
  text3: {
    marginBottom: 1,
    textAlign: "center",
    fontSize: 15,
    color: "white",
    marginTop: 5,
  },
});
