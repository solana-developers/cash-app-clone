import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  useGetBalance,
  useGetTokenAccountBalance,
  useGetTokenAccounts,
  useTransferSol,
} from "./account-data-access";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Modal,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  useTheme,
  Button,
  ActivityIndicator,
  DataTable,
  TextInput,
  MD3DarkTheme,
} from "react-native-paper";
import { useState, useMemo, useCallback } from "react";
import { ellipsify } from "../../utils/ellipsify";
import { AppModal } from "../ui/app-modal";
import { DarkTheme } from "@react-navigation/native";
import * as anchor from "@coral-xyz/anchor";
import { useAuthorization } from "../../utils/useAuthorization";
import { Program } from "@coral-xyz/anchor";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { CashApp } from "../../cash-app-program/types/cash_app";
import { UseCashAppProgram } from "../../utils/useCashAppProgram";
import { alertAndLog } from "../../utils/alertAndLog";
import { InitAccountFeature } from "../anchor-program/int-feature";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { getDomainKeySync } from "@bonfida/spl-name-service";

function lamportsToSol(balance: number) {
  return Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000;
}

export function AccountBalance({ address }: { address: PublicKey }) {
  const { cashAppPDA } = UseCashAppProgram(address);

  const query = useGetBalance(cashAppPDA);
  const theme = {
    ...MD3DarkTheme,
    ...DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...DarkTheme.colors,
    },
  };

  return (
    <>
      <View style={styles.accountBalance}>
        <Text variant="displayMedium" theme={theme}>
          ${query.data ? lamportsToSol(query.data) : "0.00"}
        </Text>
      </View>
    </>
  );
}

export function AccountButtonGroup({ address }: { address: PublicKey }) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [outModalVisible, setOutModalVisible] = useState(false);
  const [genInProgress, setGenInProgress] = useState(false);
  const [depositAmount, setDepositAmount] = useState(new anchor.BN(0));
  const newDepositAmount = new anchor.BN(depositAmount * 1000000000);
  const [withdrawAmount, setWithdrawAmount] = useState(new anchor.BN(0));
  const newWithdrawAmount = new anchor.BN(withdrawAmount * 1000000000);
  const { authorizeSession, selectedAccount } = useAuthorization();
  const { cashAppProgram, cashAppPDA } = UseCashAppProgram(address);
  const [userName, setUserName] = useState("");

  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com")
  );

  const transferFunds = useCallback(
    async (program: Program<CashApp>) => {
      let signedTransactions = await transact(
        async (wallet: Web3MobileWallet) => {
          const [authorizationResult, latestBlockhash] = await Promise.all([
            authorizeSession(wallet),
            connection.getLatestBlockhash(),
          ]);

          const { pubkey } = getDomainKeySync(userName);
          // Generate the increment ix from the Anchor program
          const incrementInstruction = await program.methods
            .transferFunds(pubkey, newDepositAmount)
            .accounts({
              user: authorizationResult.publicKey,
              fromCashAccount: cashAppPDA,
            })
            .instruction();

          const incrementTransaction = new Transaction({
            ...latestBlockhash,
            feePayer: authorizationResult.publicKey,
          }).add(incrementInstruction);

          // Sign a transaction and receive
          const signedTransactions = await wallet.signTransactions({
            transactions: [incrementTransaction],
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

  const withdrawFunds = useCallback(
    async (program: Program<CashApp>) => {
      let signedTransactions = await transact(
        async (wallet: Web3MobileWallet) => {
          const [authorizationResult, latestBlockhash] = await Promise.all([
            authorizeSession(wallet),
            connection.getLatestBlockhash(),
          ]);

          // Generate the increment ix from the Anchor program
          const incrementInstruction = await program.methods
            .withdrawFunds(newWithdrawAmount)
            .accounts({
              user: authorizationResult.publicKey,
              cashAccount: cashAppPDA,
            })
            .instruction();

          const incrementTransaction = new Transaction({
            ...latestBlockhash,
            feePayer: authorizationResult.publicKey,
          }).add(incrementInstruction);

          // Sign a transaction and receive
          const signedTransactions = await wallet.signTransactions({
            transactions: [incrementTransaction],
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

  const AddCashModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addModalVisible}
      onRequestClose={() => {
        setAddModalVisible(!addModalVisible);
      }}
    >
      <View style={styles.bottomView}>
        <View style={styles.modalView}>
          <Text style={styles.buttonText}>Add Cash</Text>
          <TextInput
            label="Amount"
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="numeric"
            mode="outlined"
            style={{
              marginBottom: 10,
              backgroundColor: "#ccc",
              width: "80%",
              marginTop: 10,
            }}
          />
          <TextInput
            label="Name"
            value={userName}
            onChangeText={setUserName}
            keyboardType="default"
            mode="outlined"
            style={{
              marginBottom: 10,
              backgroundColor: "#ccc",
              width: "80%",
              marginTop: 10,
            }}
          />
          <Button
            mode="contained"
            style={styles.modalButton}
            onPress={async () => {
              setAddModalVisible(!addModalVisible);
              if (genInProgress) {
                return;
              }
              setGenInProgress(true);
              try {
                if (!cashAppProgram || !selectedAccount) {
                  console.warn(
                    "Program/wallet is not initialized yet. Try connecting a wallet first."
                  );
                  return;
                }
                const deposit = await transferFunds(cashAppProgram);

                alertAndLog(
                  "Funds deposited into cash account ",
                  "See console for logged transaction."
                );
                console.log(deposit);
              } finally {
                setGenInProgress(false);
              }
            }}
          >
            Add
          </Button>
          <TouchableOpacity
            style={{ position: "absolute", bottom: 25 }}
            onPress={() => setAddModalVisible(false)}
          >
            <Button>Close</Button>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const OutCashModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={outModalVisible}
      onRequestClose={() => {
        setOutModalVisible(!outModalVisible);
      }}
    >
      <View style={styles.bottomView}>
        <View style={styles.modalView}>
          <Text style={styles.buttonText}>Cash Out</Text>
          <TextInput
            label="Amount"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="numeric"
            mode="outlined"
            style={{
              marginBottom: 20,
              backgroundColor: "#ccc",
              width: "80%",
              marginTop: 50,
            }}
          />
          <Button
            mode="contained"
            style={styles.modalButton}
            onPress={async () => {
              setOutModalVisible(!outModalVisible);
              if (genInProgress) {
                return;
              }
              setGenInProgress(true);
              try {
                if (!cashAppProgram || !selectedAccount) {
                  console.warn(
                    "Program/wallet is not initialized yet. Try connecting a wallet first."
                  );
                  return;
                }
                const deposit = await withdrawFunds(cashAppProgram);

                alertAndLog(
                  "Funds withdrawn from cash account ",
                  "See console for logged transaction."
                );
                console.log(deposit);
              } finally {
                setGenInProgress(false);
              }
            }}
          >
            Withdraw
          </Button>
          <TouchableOpacity
            style={{ position: "absolute", bottom: 25 }}
            onPress={() => setOutModalVisible(false)}
          >
            <Button>Close</Button>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  return (
    <>
      <View style={styles.buttonRow}>
        <AddCashModal />
        <OutCashModal />
        <DepositModal
          hide={() => setShowDepositModal(false)}
          show={showDepositModal}
          address={address}
        />
        <WithdrawModal
          hide={() => setShowWithdrawModal(false)}
          show={showWithdrawModal}
          address={address}
        />
        <Button
          mode="contained"
          style={styles.sideButton}
          onPress={() => setAddModalVisible(true)}
        >
          Add Cash
        </Button>
        <Button
          mode="contained"
          style={styles.sideButton}
          onPress={() => setOutModalVisible(true)}
        >
          Cash Out
        </Button>
      </View>
    </>
  );
}

export function DepositModal({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const transferSol = useTransferSol({ address });
  const [destinationAddress, setDestinationAddress] = useState("");
  const [amount, setAmount] = useState("");
  return (
    <AppModal
      title="Deposit into Cash Account"
      hide={hide}
      show={show}
      submit={() => {
        transferSol
          .mutateAsync({
            destination: new PublicKey(destinationAddress),
            amount: parseFloat(amount),
          })
          .then(() => hide());
      }}
      submitLabel="Deposit"
      submitDisabled={!destinationAddress || !amount}
    >
      <View style={{ padding: 20 }}>
        <TextInput
          label="Amount (SOL)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={{ marginBottom: 20 }}
        />
      </View>
    </AppModal>
  );
}

export function WithdrawModal({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const transferSol = useTransferSol({ address });
  const [destinationAddress, setDestinationAddress] = useState("");
  const [amount, setAmount] = useState("");
  return (
    <AppModal
      title="Withdraw from Cash Account"
      hide={hide}
      show={show}
      submit={() => {
        transferSol
          .mutateAsync({
            destination: new PublicKey(destinationAddress),
            amount: parseFloat(amount),
          })
          .then(() => hide());
      }}
      submitLabel="Withdraw"
      submitDisabled={!destinationAddress || !amount}
    >
      <View style={{ padding: 20 }}>
        <TextInput
          label="Amount (SOL)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={{ marginBottom: 20 }}
        />
      </View>
    </AppModal>
  );
}

export function PendingPayments({ address }: { address: PublicKey }) {
  let query = useGetTokenAccounts({ address });
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 3; // Items per page
  const theme = useTheme();

  const items = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return query.data?.slice(start, end) ?? [];
  }, [query.data, currentPage, itemsPerPage]);

  // Calculate the total number of pages
  const numberOfPages = useMemo(() => {
    return Math.ceil((query.data?.length ?? 0) / itemsPerPage);
  }, [query.data, itemsPerPage]);

  return (
    <>
      {/* Pending Payments Section */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          variant="titleMedium"
          style={{
            color: "white",
          }}
        >
          Pending Payments
        </Text>
        <EscrowModal
          hide={() => setShowModal(false)}
          show={showModal}
          address={address}
        />
      </View>
      <ScrollView>
        {query.isLoading && <ActivityIndicator animating={true} />}
        {query.isError && (
          <Text
            style={{
              padding: 8,
              backgroundColor: theme.colors.errorContainer,
              color: theme.colors.error,
            }}
          >
            Error: {query.error?.message.toString()}
          </Text>
        )}
        {query.isSuccess && (
          <>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>To</DataTable.Title>
                <DataTable.Title>Memo</DataTable.Title>
                <DataTable.Title numeric>Amount</DataTable.Title>
              </DataTable.Header>

              {query.data.length === 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text variant="bodyMedium">No pending payments.</Text>
                </View>
              )}

              {query.data.map(({ account, pubkey }) => (
                <TouchableHighlight
                  key={pubkey.toString()}
                  onPress={() => {
                    setShowModal(true);
                  }}
                  underlayColor="#DDDDDD" // Light grey color for touch feedback
                >
                  <DataTable.Row>
                    <DataTable.Cell>
                      {ellipsify(pubkey.toString())}
                    </DataTable.Cell>
                    <DataTable.Cell>
                      {ellipsify(account.data.parsed.info.mint)}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <AccountTokenBalance address={pubkey} />
                    </DataTable.Cell>
                  </DataTable.Row>
                </TouchableHighlight>
              ))}
            </DataTable>
          </>
        )}
      </ScrollView>
    </>
  );
}

export function PendingRequest({ address }: { address: PublicKey }) {
  let query = useGetTokenAccounts({ address });
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 3; // Items per page
  const theme = useTheme();

  const items = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return query.data?.slice(start, end) ?? [];
  }, [query.data, currentPage, itemsPerPage]);

  // Calculate the total number of pages
  const numberOfPages = useMemo(() => {
    return Math.ceil((query.data?.length ?? 0) / itemsPerPage);
  }, [query.data, itemsPerPage]);

  return (
    <>
      {/* Pending Payments Section */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          variant="titleMedium"
          style={{
            color: "white",
          }}
        >
          Pending Requests
        </Text>
        <EscrowModal
          hide={() => setShowModal(false)}
          show={showModal}
          address={address}
        />
      </View>
      <ScrollView>
        {query.isLoading && <ActivityIndicator animating={true} />}
        {query.isError && (
          <Text
            style={{
              padding: 8,
              backgroundColor: theme.colors.errorContainer,
              color: theme.colors.error,
            }}
          >
            Error: {query.error?.message.toString()}
          </Text>
        )}
        {query.isSuccess && (
          <>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title textStyle={{ color: "white" }}>
                  To
                </DataTable.Title>
                {/* <DataTable.Title textStyle={{ color: "white" }}>
                  Memo
                </DataTable.Title> */}
                <DataTable.Title textStyle={{ color: "white" }} numeric>
                  Amount
                </DataTable.Title>
              </DataTable.Header>

              {/* {query.data.length === 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text
                    style={{
                      color: "white",
                    }}
                  >
                    No pending payments.
                  </Text>
                </View>
              )} */}

              {/* {query.data.map(({ account, pubkey }) => ( */}
              <TouchableHighlight
                key={"test"}
                onPress={() => {
                  setShowModal(true);
                }}
                underlayColor="#DDDDDD" // Light grey color for touch feedback
              >
                <DataTable.Row>
                  <DataTable.Cell textStyle={{ color: "white" }}>
                    {ellipsify("H51gvSJ11enukDJn3Zj1TmcpzNCRFTgHTesGsUXiHmc5")}
                  </DataTable.Cell>
                  {/* <DataTable.Cell textStyle={{ color: "white" }}>
                    {ellipsify("test")}
                  </DataTable.Cell> */}
                  <DataTable.Cell textStyle={{ color: "white" }} numeric>
                    {/* <AccountTokenBalance address={pubkey} /> */}
                    {5}
                  </DataTable.Cell>
                </DataTable.Row>
              </TouchableHighlight>
              {/* ))} */}
            </DataTable>
          </>
        )}
      </ScrollView>
    </>
  );
}

export function AccountTokenBalance({ address }: { address: PublicKey }) {
  const query = useGetTokenAccountBalance({ address });
  return query.isLoading ? (
    <ActivityIndicator animating={true} />
  ) : query.data ? (
    <Text>{query.data?.value.uiAmount}</Text>
  ) : (
    <Text>Error</Text>
  );
}

export function EscrowModal({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");

  return (
    <AppModal
      title="Create New Escrow"
      hide={hide}
      show={show}
      submit={() => {}}
      submitLabel="Submit"
      submitDisabled={!destinationAddress || !amount}
    >
      <View style={{ padding: 20 }}>
        <TextInput
          label="Amount (SOL)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={{ marginBottom: 20 }}
        />
        <TextInput
          label="Recipient"
          value={destinationAddress}
          onChangeText={setDestinationAddress}
          keyboardType="numeric"
          mode="outlined"
          style={{ marginBottom: 20 }}
        />
        <TextInput
          label="Duration"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          mode="outlined"
          style={{ marginBottom: 20 }}
        />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  accountBalance: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  accountButtonGroup: {
    paddingVertical: 4,
    flexDirection: "row",
  },
  button: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333", // Darker button background
    borderRadius: 40,
  },
  error: {
    color: "red",
    padding: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  sideButton: {
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    backgroundColor: "#555",
    paddingTop: 5, // Top padding
    paddingBottom: 5,
    justifyContent: "center",
    borderRadius: 50,
  },
  modalButton: {
    marginLeft: 6,
    marginRight: 6,
    backgroundColor: "#555",
    paddingTop: 5, // Top padding
    paddingBottom: 5,
    justifyContent: "center",
    borderRadius: 50,
  },
  modalView: {
    backgroundColor: "#444",
    padding: 35,
    alignItems: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2, // Negative value to lift the shadow up
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    width: "100%", // Ensure the modal occupies full width
    height: "40%", // Only take up half the screen height
  },
  bottomView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF", // Light text color for buttons
  },
});
