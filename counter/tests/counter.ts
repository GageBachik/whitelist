import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Counter } from "../target/types/counter";
import fs from "fs";
import gaurd_idl from "../../gaurd/target/idl/gaurd.json";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;

  const gaurdIdl = gaurd_idl as anchor.Idl;

  const gaurdAddress = new anchor.web3.PublicKey(
    "GaUrdNt59ULmP6jjrHao6wpgw88AARkForCrTSvkw7CL"
  );

  const gaurdProgram = new Program(gaurdIdl, gaurdAddress.toString(), provider);

  const wallet = provider.wallet;
  // import the degen wallet for RSO signing
  const rsoKeypair =
    process.env.HOME +
    "/projects/mlh/whitelist/counter/Rso7VaZZCdHNjP783UbpyhzPY4MxDw85n6vGM4tobJ9.json";
  const rsoWallet = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(rsoKeypair).toString()))
  );

  // import a diff user wallet for whitelisted signing
  const whitelistedKeypair =
    process.env.HOME +
    "/projects/degen-toy-machine/wallets/SEA1xkZzPCUJBb5mcNb6ts9VExNr2kYMit3T5poqr94.json";
  const whitelistedWallet = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(whitelistedKeypair).toString()))
  );

  // it("Init Counter!", async () => {
  //   const counter = anchor.web3.Keypair.generate();
  //   console.log("counter account:", counter.publicKey.toString());
  //   const tx = await program.methods
  //     .initialize()
  //     .accounts({
  //       counter: counter.publicKey,
  //       authority: wallet.publicKey,
  //     })
  //     .signers([counter])
  //     .rpc();
  //   console.log("Counter Created", tx);
  // });

  // counter pubkey: 7g59ycDV2nMaXBhHqKMmfTMEgRgWNFBYMfwuE6Mai8LQ
  // whitelist config pubkey: 8ksqV3f3WtGvnPYGj6TQQKwFLkjuvnKpegSUbcrtPTd1

  it("AddOne!", async () => {
    const counter = new anchor.web3.PublicKey(
      "7g59ycDV2nMaXBhHqKMmfTMEgRgWNFBYMfwuE6Mai8LQ"
    );
    const counterAccount = await program.account.counter.fetch(counter);
    console.log("counter account:", counterAccount.count.toNumber());
    const whitelistConfig = new anchor.web3.PublicKey(
      "8ksqV3f3WtGvnPYGj6TQQKwFLkjuvnKpegSUbcrtPTd1"
    );
    const [whitelistAccount, _whitelistAccountBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [whitelistConfig.toBuffer(), wallet.publicKey.toBuffer()],
        gaurdProgram.programId
      );
    console.log("wallet:", wallet.publicKey.toString());
    const tx = await program.methods
      .addOne()
      .accounts({
        counter: counter,
        authority: wallet.publicKey,
        whitelistConfig: whitelistConfig,
        whitelistAccount: whitelistAccount,
      })
      .rpc();
    console.log("added one to count", tx);
    const counterAccountAfter = await program.account.counter.fetch(counter);
    console.log("Updated Count:", counterAccountAfter.count.toNumber());
  });

  it("AddOneRSO!", async () => {
    const rsoTx = new anchor.web3.Transaction();
    const counter = new anchor.web3.PublicKey(
      "7g59ycDV2nMaXBhHqKMmfTMEgRgWNFBYMfwuE6Mai8LQ"
    );
    const counterAccount = await program.account.counter.fetch(counter);
    console.log("counter account:", counterAccount.count.toNumber());
    console.log("wallet:", wallet.publicKey.toString());
    const inWhitelistIx = await gaurdProgram.methods
      .inWhitelist()
      .accounts({
        // whitelist config
        config: new anchor.web3.PublicKey(
          "8ksqV3f3WtGvnPYGj6TQQKwFLkjuvnKpegSUbcrtPTd1"
        ),
        // whitelist account
        wallet: (
          await anchor.web3.PublicKey.findProgramAddress(
            [
              new anchor.web3.PublicKey(
                "8ksqV3f3WtGvnPYGj6TQQKwFLkjuvnKpegSUbcrtPTd1"
              ).toBuffer(),
              wallet.publicKey.toBuffer(),
            ],
            gaurdProgram.programId
          )
        )[0],
        user: wallet.publicKey,
      })
      .instruction();
    rsoTx.add(inWhitelistIx);
    const addOneRsoIx = await program.methods
      .addOneRso()
      .accounts({
        counter: counter,
        rso: rsoWallet.publicKey,
      })
      .instruction();
    rsoTx.add(addOneRsoIx);
    const tx = await program.provider.sendAndConfirm(rsoTx, [rsoWallet]);
    console.log("added one to count with rso", tx);
    const counterAccountAfter = await program.account.counter.fetch(counter);
    console.log("Updated Count:", counterAccountAfter.count.toNumber());
  });
});
