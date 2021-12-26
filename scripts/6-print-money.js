import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// The address of our ERC-20 contract from the step before
const tokenModule = sdk.getTokenModule("0x245926A965938f100860938985B184c1e60Fd9fE");

(async () => {
  try {
    // The max supply of the token
    const amount = 1_000_000;
    // Use the utils function from "ethers" to convert the amount
    // to have 18 decimals (the standard for ERC20 tokens)
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // Interact with the deployed ERC-20 contract and mint the tokens
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    // Print out how many of the tokens are out there now
    console.log("✅ There now is", ethers.utils.formatUnits(totalSupply, 18), "$SHARK in circulation");
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();
