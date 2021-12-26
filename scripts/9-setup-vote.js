import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// The governance contract
const voteModule = sdk.getVoteModule("0xc2F32EEe33b157196505eB0425a64A6dE26229A0");

// The ERC-20 contract
const tokenModule = sdk.getTokenModule("0x245926A965938f100860938985B184c1e60Fd9fE");

(async () => {
  try {
    // Give the treasury the power to mint additional token if needed
    await tokenModule.grantRole("minter", voteModule.address);

    console.log("Successfully gave vote module permissions to act on token module");
  } catch (error) {
    console.error("failed to grant vote module permissions on token module", error);
    process.exit(1);
  }

  try {
    // Grab the wallet's token balance (since I hold almost 100% of the supply right now)
    const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);

    // Grab 49% of the supply that I hold
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent49 = ownedAmount.div(100).mul(49);

    // Transfer 90% of the supply to the voting contract
    await tokenModule.transfer(voteModule.address, percent49);

    console.log("✅ Successfully transferred tokens to vote module");
  } catch (err) {
    console.error("failed to transfer tokens to vote module", err);
  }
})();
