import {
  devnet,
  getAllDomains,
  getDomainKeySync,
  getNameAccountKeySync,
  NameRegistryState,
  reverseLookup,
} from "@bonfida/spl-name-service";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { Button } from "react-native-paper";
import { TextInput, View, Text } from "react-native";
import { useAuthorization } from "../../utils/useAuthorization";
import { alertAndLog } from "../../utils/alertAndLog";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import React from "react";
import { getAssociatedTokenAddressSync, NATIVE_MINT } from "@solana/spl-token";

export function SnsButton({ address }: { address: PublicKey }) {
  const { authorizeSession } = useAuthorization();
  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com")
  );

  const space = 1000;
  const [name, setName] = useState("");
  const [signingInProgress, setSigningInProgress] = useState(false);

  const signTransaction = useCallback(async () => {
    let signedTransactions = await transact(
      async (wallet: Web3MobileWallet) => {
        // First, request for authorization from the wallet and fetch the latest
        // blockhash for building the transaction.
        const [authorizationResult, latestBlockhash] = await Promise.all([
          authorizeSession(wallet),
          connection.getLatestBlockhash(),
        ]);

        // const tx = new Transaction();

        const [, ix] = await devnet.bindings.registerDomainName(
          connection,
          "bri", // The name of the domain you want to register
          1_000,
          address!, // PublicKey of fee payer
          getAssociatedTokenAddressSync(NATIVE_MINT, address!, true), // import from @solana/spl-token
          NATIVE_MINT
        );

        // tx.add(...ix);
        // tx.recentBlockhash = latestBlockhash.blockhash;
        // tx.feePayer = user!;
        const lamports = await connection.getMinimumBalanceForRentExemption(
          1_000 + NameRegistryState.HEADER_LEN
        );
        // Construct a transaction.
        const instructions: TransactionInstruction =
          await devnet.bindings.createNameRegistry(
            connection,
            name,
            space,
            address,
            address,
            lamports
          );

        const snsTransaction = new Transaction({
          ...latestBlockhash,
          feePayer: authorizationResult.publicKey,
        }).add(...ix);

        // Sign a transaction and receive
        const signedTransactions = await wallet.signTransactions({
          transactions: [snsTransaction],
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
  }, [authorizeSession, connection]);

  return (
    <View
      style={{
        padding: 20,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextInput
        value={name}
        onChangeText={setName}
        style={{
          marginBottom: 20,
          backgroundColor: "#f0f0f0",
          height: 50,
          padding: 10,
          fontSize: 18,
          width: "80%",
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
            const signedTransaction = await signTransaction();
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
        Set User Name
      </Button>
    </View>
  );
}

// export function DomainNameButton({ address }: { address: PublicKey }) {
//   const [domain, setDomain] = useState("Click to load domain");

//   const connection = new Connection("https://api.mainnet-beta.solana.com");

//   const fetchDomainName = async () => {
//     setDomain("Loading...");
//     try {
//       console.log("Fetching domain");
//       const { pubkey } = getDomainKeySync("bonfida");
//       console.log("Pubkey:", pubkey.toString());

//       const domainName = await reverseLookup(connection, pubkey);
//       console.log("Domain: ", domainName);

//       setDomain(domainName);
//     } catch (error) {
//       console.error("Error:", error.type);
//       setDomain("Failed to load domain");
//     }
//   };

//   return (
//     <View
//       style={{
//         padding: 20,
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text style={{ color: "white", marginBottom: 10 }}>{domain}</Text>
//       <Button mode="contained" onPress={fetchDomainName} color="#007AFF">
//         {" "}
//         Get Name{" "}
//       </Button>
//     </View>
//   );
// }

export function DomainNameButton({ address }: { address: PublicKey }) {
  const [domain, setDomain] = useState("Loading...");
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  // const connection = new Connection("https://api.devnet.solana.com");

  useEffect(() => {
    const fetchDomainName = async () => {
      try {
        const { pubkey } = getDomainKeySync("bonfida");
        const domain = await reverseLookup(connection, pubkey);
        setDomain(domain);
      } catch (error) {
        console.error("Error:", error.type);
        setDomain("Loading...");
      }
    };

    fetchDomainName();
  }, []);

  return (
    <View
      style={{
        padding: 20,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white" }}>{domain}</Text>
    </View>
  );
}
// return (
//   <View
//     style={{
//       padding: 20,
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//     }}
//   >
//     <TextInput
//       value={name}
//       onChangeText={setName}
//       style={{
//         marginBottom: 20,
//         backgroundColor: "#f0f0f0",
//         height: 50,
//         padding: 10,
//         fontSize: 18,
//         width: "80%",
//       }}
//     />
//     <Button mode="contained" onPress={signTransaction}>
//       Set User Name
//     </Button>
//   </View>
// );
// }
