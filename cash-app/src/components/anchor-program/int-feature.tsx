import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { useAuthorization } from "../../utils/useAuthorization";
import InitAccount from "./init-ui";
export function InitAccountFeature() {
  const { selectedAccount } = useAuthorization();
  const user = selectedAccount.publicKey;

  if (!selectedAccount) {
    return null;
  }
  const theme = useTheme();

  return (
    <>
      <View style={{ marginTop: 24, marginBottom: 24, alignItems: "center" }}>
        <InitAccount user={user!} />
      </View>
    </>
  );
}
