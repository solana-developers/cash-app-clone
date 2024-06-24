import { View, StyleSheet } from "react-native";
import { DomainNameButton, SnsButton } from "./sns-ui";
import { useAuthorization } from "../../utils/useAuthorization";
import React, { useCallback } from "react";

export function SnsFeature() {
  const { selectedAccount } = useAuthorization();
  if (!selectedAccount) {
    return null;
  }
  return (
    <>
      <DomainNameButton address={selectedAccount.publicKey} />
      <View style={styles.buttonGroup}>
        <SnsButton address={selectedAccount.publicKey} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    marginTop: 16,
    flexDirection: "row",
  },
});
