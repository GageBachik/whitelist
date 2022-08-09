import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Gaurd } from "../target/types/gaurd";

describe("gaurd", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;

  const program = anchor.workspace.Gaurd as Program<Gaurd>;

  // it("Initialize Whitelist Config", async () => {
  //   const config = anchor.web3.Keypair.generate();
  //   console.log("config account:", config.publicKey.toString());
  //   const tx = await program.methods
  //     .initialize()
  //     .accounts({
  //       config: config.publicKey,
  //       authority: wallet.publicKey,
  //     })
  //     .signers([config])
  //     .rpc();
  //   console.log("Your whitelist config was created", tx);
  // });

  // pubkey of config: 8ksqV3f3WtGvnPYGj6TQQKwFLkjuvnKpegSUbcrtPTd1
  // pubkey to whitelist: SEA1xkZzPCUJBb5mcNb6ts9VExNr2kYMit3T5poqr94

  it("Add Wallet To Whitelist", async () => {
    const config = new anchor.web3.PublicKey(
      "8ksqV3f3WtGvnPYGj6TQQKwFLkjuvnKpegSUbcrtPTd1"
    );
    console.log("config account:", config.toString());
    const userWallet = new anchor.web3.PublicKey(
      "SEA1xkZzPCUJBb5mcNb6ts9VExNr2kYMit3T5poqr94"
    );
    const [walletKey, _walletBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [config.toBuffer(), userWallet.toBuffer()],
        program.programId
      );
    console.log("walletKey:", walletKey.toString());
    const tx = await program.methods
      .addWallet()
      .accounts({
        config: config,
        authority: wallet.publicKey,
        wallet: walletKey,
        user: userWallet,
      })
      .rpc();
    console.log("Your wallet was added to whitelist", tx);
  });
});
