import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol";
import { useState, useCallback } from "react";
import { Button } from "react-native-paper";
import { alertAndLog } from "../../utils/alertAndLog";
import { useAuthorization } from "../../utils/useAuthorization";
import { useMobileWallet } from "../../utils/useMobileWallet";

export function ConnectButton() {
  const { authorizeSession } = useAuthorization();
  const { connect } = useMobileWallet();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);
  const handleConnectPress = useCallback(async () => {
    try {
      if (authorizationInProgress) {
        return;
      }
      setAuthorizationInProgress(true);
      await connect();
    } catch (err: any) {
      alertAndLog(
        "Error during connect",
        err instanceof Error ? err.message : err
      );
    } finally {
      setAuthorizationInProgress(false);
    }
  }, [authorizationInProgress, authorizeSession]);
  return (
    <Button
      mode="contained"
      disabled={authorizationInProgress}
      onPress={handleConnectPress}
      style={{ flex: 1, backgroundColor: "#444" }}
    >
      Connect
    </Button>
  );
}

export function SignInButton() {
  const { authorizeSession } = useAuthorization();
  const { signIn } = useMobileWallet();
  const [signInInProgress, setSignInInProgress] = useState(false);
  const handleConnectPress = useCallback(async () => {
    try {
      if (signInInProgress) {
        return;
      }
      setSignInInProgress(true);
      await signIn();
    } catch (err: any) {
      alertAndLog(
        "Error during sign in",
        err instanceof Error ? err.message : err
      );
    } finally {
      setSignInInProgress(false);
    }
  }, [signInInProgress, authorizeSession]);
  return (
    <Button
      mode="outlined"
      disabled={signInInProgress}
      onPress={handleConnectPress}
      style={{ marginLeft: 4, flex: 1, backgroundColor: "#ccc" }}
    >
      Sign in
    </Button>
  );
}
