import { View, StyleSheet } from "react-native";
import { List, RadioButton, Text } from "react-native-paper";
import { Cluster } from "./cluster-data-access";

export function ClusterPickerRadioButtonGroupRow({
  cluster,
}: {
  cluster: Cluster;
}) {
  return (
    <List.Item
      title={cluster.name}
      description={cluster.endpoint}
      right={() => <RadioButton value={cluster.name} />}
      style={styles.listItem}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    color: "#ccc",
  },
});
