import { Button, Text } from "react-native-paper";
import { alertAndLog } from "../../utils/alertAndLog";
import { TextInput, View } from "react-native";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getDomainKeySync } from "@bonfida/spl-name-service";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { useCallback, useState } from "react";
import { Program } from "@coral-xyz/anchor";
import { CashApp } from "../../cash-app-program/types/cash_app";
import { UseCashAppProgram } from "../../utils/useCashAppProgram";
import { useAuthorization } from "../../utils/useAuthorization";

export function AddFriend({ address }: { address: PublicKey }) {
  const [userName, setUserName] = useState("");
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com")
  );
  const { authorizeSession, selectedAccount } = useAuthorization();
  const { cashAppProgram, cashAppPDA, friends } = UseCashAppProgram(address);
  const user = friends.data?.balance;

  const addFriend = useCallback(
    async (program: Program<CashApp>) => {
      let signedTransactions = await transact(
        async (wallet: Web3MobileWallet) => {
          const [authorizationResult, latestBlockhash] = await Promise.all([
            authorizeSession(wallet),
            connection.getLatestBlockhash(),
          ]);

          const { pubkey } = getDomainKeySync(userName);
          // Generate the increment ix from the Anchor program
          const addFriendIX = await program.methods
            .addFriend(pubkey)
            .accounts({
              user: authorizationResult.publicKey,
              cashAccount: cashAppPDA,
            })
            .instruction();

          const addFriendTX = new Transaction({
            ...latestBlockhash,
            feePayer: authorizationResult.publicKey,
          }).add(addFriendIX);

          // Sign a transaction and receive
          const signedTransactions = await wallet.signTransactions({
            transactions: [addFriendTX],
          });

          return signedTransactions[0];
        }
      );

      let txSignature = await connection.sendRawTransaction(
        signedTransactions.serialize(),
        {
          skipPreflight: true,
        }
      );

      const confirmationResult = await connection.confirmTransaction(
        txSignature,
        "confirmed"
      );

      if (confirmationResult.value.err) {
        throw new Error(JSON.stringify(confirmationResult.value.err));
      } else {
        console.log("Transaction successfully submitted!");
      }
    },
    [authorizeSession, connection, cashAppPDA]
  );

  return (
    <View
      style={{
        padding: 5,
        // flex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text
        variant="titleMedium"
        style={{
          color: "white",
          marginBottom: 10,
        }}
      >
        {" "}
        Add New Friend:
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextInput
          value={userName}
          onChangeText={setUserName}
          style={{
            marginBottom: 10,
            marginTop: 10,
            backgroundColor: "#f0f0f0",
            height: 40,
            padding: 10,
            fontSize: 18,
            width: "60%",
            marginLeft: 20,
            marginRight: 20,
          }}
        />
        <Button
          mode="contained"
          disabled={signingInProgress}
          onPress={async () => {
            if (signingInProgress) {
              return;
            }
            setSigningInProgress(true);
            try {
              const signedTransaction = await addFriend(cashAppProgram);
              alertAndLog(
                "Transaction signed",
                "View recent transactions for more information."
              );
              console.log(signedTransaction);
            } catch (err: any) {
              alertAndLog(
                "Error during signing",
                err instanceof Error ? err.message : err
              );
            } finally {
              setSigningInProgress(false);
            }
          }}
        >
          Add
        </Button>
      </View>
      {/* <Button
        mode="contained"
        disabled={signingInProgress}
        onPress={async () => {
          friends.refetch();
        }}
      >
        Refresh
      </Button> */}
      <Text
        variant="titleMedium"
        style={{
          color: "white",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#333",
          }}
        >
          <Text
            variant="titleMedium"
            style={{
              color: "white",
              marginBottom: 10,
            }}
          >
            {friends.data?.user.toString()}
          </Text>
        </View>
      </Text>
    </View>
  );
}
