import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { useAuthorization } from "../../utils/useAuthorization";
import DepositFunds from "./deposit-ui";

export function DepositFundsFeature() {
  const { selectedAccount } = useAuthorization();
  const user = selectedAccount.publicKey;

  if (!selectedAccount) {
    return null;
  }
  const theme = useTheme();

  return (
    <>
      <View style={{ marginTop: 24, alignItems: "center" }}>
        <DepositFunds user={user!} />
      </View>
    </>
  );
}
