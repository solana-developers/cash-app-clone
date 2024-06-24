import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export const Section: React.FC<{
  children?: ReactNode;
  description?: string;
  title?: string;
}> = ({ children, description, title }) => {
  return (
    <View style={styles.sectionContainer}>
      {title ? (
        <Text style={styles.titleText} variant="headlineMedium">
          {title}
        </Text>
      ) : null}
      {description ? <Text variant="bodyMedium">{description}</Text> : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontWeight: "bold",
  },
  sectionContainer: {
    marginTop: 18,
  },
  childrenContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
});
