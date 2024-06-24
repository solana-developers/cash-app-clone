import { ViewStyle, View, StyleSheet } from "react-native";
import { Modal, Text, Button, Portal, useTheme } from "react-native-paper";

interface AppModalProps {
  children: React.ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
  contentContainerStyle?: ViewStyle;
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel = "Save", // Defaulting submitLabel to "Save" here
}: AppModalProps) {
  const theme = useTheme();
  return (
    <Portal>
      <Modal
        visible={show}
        onDismiss={hide}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: "#d9d9d9" },
        ]}
      >
        <View>
          <Text style={styles.title}>{title}</Text>
          {children}
          <View style={styles.action}>
            <View style={styles.buttonGroup}>
              {submit && (
                <Button
                  mode="contained"
                  onPress={submit}
                  disabled={submitDisabled}
                  style={styles.button}
                >
                  {submitLabel}
                </Button>
              )}
              <Button onPress={hide} style={styles.button}>
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  action: {
    marginTop: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around", // Adjust based on your design requirements
  },
  button: {
    margin: 4,
  },
});
