import ClusterPickerFeature from "../components/cluster/cluster-picker-feature";
import { StyleSheet, View } from "react-native";

export function SettingsScreen() {
  return (
    <>
      <View style={styles.screenContainer}>
        <ClusterPickerFeature />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    height: "100%",
    padding: 16,
    flex: 1,
  },
});
