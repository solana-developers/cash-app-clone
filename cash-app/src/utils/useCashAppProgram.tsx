import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";

import { CashApp, IDL } from "../cash-app-program/types/cash_app";
import { useQuery } from "@tanstack/react-query";

export function UseCashAppProgram(user: PublicKey) {
  const cashAppProgramId = new PublicKey(
    "BxCbQks4iaRvfCnUzf3utYYG9V53TDwVLxA6GGBnhci4"
  );

  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com")
  );

  const [cashAppPDA] = useMemo(() => {
    const counterSeed = user.toBuffer();
    return PublicKey.findProgramAddressSync([counterSeed], cashAppProgramId);
  }, [cashAppProgramId]);

  // const provider = useMemo(() => {
  //   if (!anchorWallet) {
  //     return null;
  //   }
  //   return new AnchorProvider(connection, anchorWallet, {
  //     preflightCommitment: "confirmed",
  //     commitment: "processed",
  //   });
  // }, [anchorWallet, connection]);

  const cashAppProgram = useMemo(() => {
    return new Program<CashApp>(IDL, cashAppProgramId, { connection });
  }, [cashAppProgramId]);

  const value = useMemo(
    () => ({
      cashAppProgram: cashAppProgram,
      cashAppProgramId: cashAppProgramId,
      cashAppPDA: cashAppPDA,
    }),
    [cashAppProgram, cashAppProgramId, cashAppPDA]
  );

  const friends = useQuery({
    queryKey: [
      "cash_account",
      "fetch",
      { endpoint: connection.rpcEndpoint, user },
    ],
    queryFn: () => cashAppProgram.account.cashAccount.fetch(user),
  });

  return { value, friends, cashAppProgram, cashAppPDA };
}
