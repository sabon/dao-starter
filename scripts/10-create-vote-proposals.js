import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// The voting contract
const voteModule = sdk.getVoteModule("0xc2F32EEe33b157196505eB0425a64A6dE26229A0");

// The ERC-20 contract.
const tokenModule = sdk.getTokenModule("0x245926A965938f100860938985B184c1e60Fd9fE");

(async () => {
  try {
    const amount = 420_000;
    // Create proposal to mint 420,000 new token to the treasury
    await voteModule.propose("Should the DAO mint an additional " + amount + " tokens into the treasury?", [
      {
        // nativeToken is ETH. nativeTokenValue is the amount of ETH we want
        // to send in this proposal. In this case, we're sending 0 ETH.
        // We're just minting new tokens to the treasury. So, set to 0.
        nativeTokenValue: 0,
        transactionData: tokenModule.contract.interface.encodeFunctionData(
          // Mint. Target: the voteModule, which is acting as treasruy
          "mint",
          [voteModule.address, ethers.utils.parseUnits(amount.toString(), 18)]
        ),
        // Token module that actually executes the mint
        toAddress: tokenModule.address
      }
    ]);

    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 6_900;
    // Create proposal to transfer 6,900 tokens to myself, for being awesome
    await voteModule.propose(
      "Should the DAO transfer " +
        amount +
        " tokens from the treasury to " +
        process.env.WALLET_ADDRESS +
        " for being awesome?",
      [
        {
          // Again, sending 0 ETH, just the token
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // Transfer from the treasury to my wallet
            "transfer",
            [process.env.WALLET_ADDRESS, ethers.utils.parseUnits(amount.toString(), 18)]
          ),

          toAddress: tokenModule.address
        }
      ]
    );

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();
