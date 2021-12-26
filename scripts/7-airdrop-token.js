import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// The address to the ERC-1155 membership NFT contract
const bundleDropModule = sdk.getBundleDropModule("0xd9deA3a94429F8B67526c2f0D2FefDAE9EA7293A");

// The address to the ERC-20 token contract
const tokenModule = sdk.getTokenModule("0x245926A965938f100860938985B184c1e60Fd9fE");

(async () => {
  try {
    // Grab all the addresses of people who own membership NFT, which has a tokenId of 0
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length === 0) {
      console.log("No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!");
      process.exit(0);
    }

    // Loop through the array of addresses
    const airdropTargets = walletAddresses.map((address) => {
      // Pick a random # between 1000 and 10000
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      // Set up the target
      const airdropTarget = {
        address,
        // Needs 18 decimal placees
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18)
      };

      return airdropTarget;
    });

    // Call transferBatch on all the airdrop targets
    console.log("🌈 Starting airdrop...");
    await tokenModule.transferBatch(airdropTargets);
    console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
  } catch (err) {
    console.error("Failed to airdrop tokens", err);
  }
})();
